const { Platform, Account } = require("../models/db");
const connectRabbitMq = require("../queue/messageSender");

const { spawn } = require("child_process");
const { Review } = require("../models/db");

const QUEUE_NAME = 'platform_jobs';

const addPlatform = async (req, res) => {
    const { platformName, platformLink, instantCount } = req.body;
    const api_key = req.headers['api_key'];
    if(!api_key) {
        return res.json({ success: true, message: 'Missing api key in headers'});
    }

    try {
        const account = await Account.findOne({
            where: { api_key }
        })
        if(!account) {
            return res.json({ success: true, message: 'Not authorised user'});
        }
        const platform = await Platform.create(
            {
                account_id: account.id,
                platform_name: platformName,
                platform_link: platformLink,
                instant_count: instantCount,
            }
        )
        const channel = await connectRabbitMq();

        const jobPayload = {
            platformId: platform.id,
            platformName: platform.platform_name,
            platformLink: platform.platform_link,
            accountId: account.id,
            instantCount: platform.instant_count,
        }

        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(jobPayload)), {
            persistent: true,
        });

        console.log('Job added to queue:', jobPayload);

        return platform.id;

    } catch (error) {
        console.error('Error in adding platform link to database', error);
        throw error
    }
}

const getReviews = async (req, res) => {
    try {
        const accountId = req.cookies?.account_id;

        if (!accountId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No account ID in cookies." });
        }

        const { platformId } = req.body;

        if (!platformId) {
            return res.status(400).json({ success: false, message: "Bad request: Platform ID is required." });
        }

        const platform = await Platform.findOne({
            where: { id: platformId, account_id: accountId },
        });

        if (!platform) {
            return res.status(404).json({ success: false, message: "Platform not found or unauthorized access." });
        }

        const reviews = await Review.findAll({
            where: { platform_id: platformId },
            attributes: ["id", "review", "created_at"], 
            order: [["created_at", "DESC"]],
        });

        if (reviews.length === 0) {
            return res.status(200).json({ success: true, message: "No reviews found for this platform.", reviews: [] });
        }

        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const fetchReviewsForPlatform = async (platformData) => {
    const platformName = platformData.platformName;
    const platformLink = platformData.platformLink;

    return new Promise((resolve, reject) => {
        try {
            console.log("Control going to browser-use ___________");
            console.log(`${platformName} ------- ${platformLink}`);
        
            const pythonProcess = spawn("python3", ["agent/browserUse.py", platformName, platformLink]);
            let pythonOutput = "";

            // Capture data from Python stdout
            pythonProcess.stdout.on("data", (data) => {
                pythonOutput += data.toString();
            });

            // Capture error data from Python stderr
            pythonProcess.stderr.on("data", (error) => {
                console.error(`Python Error: ${error}`);
            });

            // Handle process exit
            pythonProcess.on("exit", async (code) => {
                if (code === 0) {
                    console.log("Python script executed successfully.");
                    try {
                        const reviews = JSON.parse(pythonOutput); // Parse JSON data

                        // Insert reviews into the database
                        for (const review of reviews) {
                            await Review.create({
                                account_id: platformData.accountId,
                                platform_id: platformData.platformId,
                                review: review, // Review JSON
                            });
                        }

                        console.log("Reviews successfully stored in the database.");
                        resolve({ success: true, message: "Reviews fetched and stored." });
                    } catch (err) {
                        console.error("Error parsing or storing reviews:", err);
                        reject(err);
                    }
                } else {
                    console.error(`Python script exited with code ${code}.`);
                    reject(new Error("Python script failed."));
                }
            });

            pythonProcess.on("error", (err) => {
                console.error(`Failed to start Python process: ${err.message}`);
                reject(err);
            });

            console.log("Control ends here");
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    addPlatform,
    getReviews,
    fetchReviewsForPlatform,
}
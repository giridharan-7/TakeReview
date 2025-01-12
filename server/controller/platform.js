const { Platform, Account } = require("../models/db");
const connectRabbitMq = require("../queue/messageSender");

const { spawn } = require("child_process");

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

        // first of all see the platfrom created time is <10sec

        // if it is <10sec -> check instant_ready -> if it is true -> return data from elastic 

        // if it is >10sec -> hit the postgres local db and get the data

        
    } catch (error) {
        
    }
}

const fetchReviewsForPlatform = async (platformData) => {
    const platformName = platformData.platformName;
    const platformLink = platformData.platformLink;

    return new Promise((resolve, reject) => {
        try {
            console.log("Control going to browser-use ___________");
            console.log(`${platformName} ------- ${platformLink}`);
        
            const pythonProcess = spawn("python3", ["agent/browserUse.py", platformName, platformLink]);
        
            pythonProcess.stdout.on("data", (data) => {
                console.log(`Python Output: ${data}`);
            });
        
            pythonProcess.stderr.on("data", (error) => {
                console.error(`Python Error: ${error}`);
            });
        
            pythonProcess.on("error", (err) => {
                console.error(`Failed to start Python process: ${err.message}`);
            });
        
            pythonProcess.on("exit", (code) => {
                if (code === 0) {
                    console.log("Python script executed successfully.");
                } else {
                    console.error(`Python script exited with code ${code}.`);
                }
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
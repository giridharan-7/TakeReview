const { Platform, Account } = require("../models/db");

const RABBITMQ_URL = 'amqp://localhost';  // rabitmq url
const QUEUE_NAME = 'platform_jobs';

async function connectRabbitMq() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        return channel;
    } catch (error) {
        console.error('RabbitMQ Connection Error', error);
        throw error
    }
} 


const addPlatform = async (req, res) => {
    const { platformName, platformLink, instantCount } = req.body;

    const { api_key } = req.headers['api_key'];

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

        // add the platform as a job rabbitmq to the queue

        // return platform id

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

module.exports = {
    addPlatform,
    getReviews
}
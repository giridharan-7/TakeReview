const { fetchReviewsForPlatform } = require("../controller/platform");
const connectRabbitMq = require("./messageSender");

const QUEUE_NAME = 'platform_jobs';

async function watchQueue() {
    try {
        const channel = await connectRabbitMq();
        channel.consume(
            QUEUE_NAME,
            async (message) => {
                if (message !== null){
                    const platformData = JSON.parse(message.content.toString());

                    await fetchReviewsForPlatform(platformData);

                    channel.ack(message);
                }
            },
            { noAck: false}
        )
    } catch ( error ){
        console.error('RabbitMQ Connection Error', error);
        throw error
    }
}

module.exports = watchQueue;
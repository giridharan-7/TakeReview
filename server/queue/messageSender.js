var amqp = require('amqplib/callback_api');

const RABBITMQ_URL = 'amqp://localhost';
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

module.exports = connectRabbitMq;
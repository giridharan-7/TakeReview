const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'platform_jobs';

async function connectRabbitMq() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        console.log('Connected to RabbitMQ');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        return channel;
    } catch (error) {
        console.error('RabbitMQ Connection Error', error);
        throw error;
    }
}

module.exports = connectRabbitMq;

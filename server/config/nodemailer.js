const nodemailer = require('nodemailer');
require("dotenv").config({ path: require('find-config')('.env') })


const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

module.exports = { transporter }
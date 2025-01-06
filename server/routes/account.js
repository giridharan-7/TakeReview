const express = require('express');
const router = express.Router();
const { signup, verifyEmail, login, sendVerificationOtp } = require('../controller/account.js');

router.post('/signup', signup);
router.post('/signup/sendotp', sendVerificationOtp);
router.post('/signup/verify', verifyEmail);

router.post('/login', login);

module.exports = router;
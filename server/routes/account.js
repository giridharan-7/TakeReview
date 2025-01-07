const express = require('express');
const router = express.Router();
const { signup, verifyEmail, login, sendVerificationOtp } = require('../controller/account.js');

router.post('/signup', signup);
router.post('/login', login);

router.post('/signup/sendotp', sendVerificationOtp);
router.post('/signup/verify', verifyEmail);


module.exports = router;
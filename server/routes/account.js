const express = require('express');
const router = express.Router();
const { signup, verifyEmail, login } = require('../controller/account.js');

router.use('/signup', signup);
router.post('/signup/verify', verifyEmail);

router.post('/login', login);

module.exports = router;
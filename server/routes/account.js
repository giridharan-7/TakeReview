const express = require('express');
const router = express.Router();
const { signin, verify, login } = require('../controller/account');

router.post('/signup', signin);
router.post('/signup/verify', verify);

router.post('/login', login);
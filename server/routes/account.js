const express = require('express');
const router = express.Router();
const { signin, verify, login } = require('../controller/account');

router.post('/signin', signin);
router.post('/signin/verify', verify);

router.post('/login', login);
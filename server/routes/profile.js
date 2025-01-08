const express = require('express');
const { addPlatform, getReviews } = require('../controller/platform');
const router = express.Router();



router.post('/add', addPlatform);
router.get('/reviews', getReviews);


module.exports = router;
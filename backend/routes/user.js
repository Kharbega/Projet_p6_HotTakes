const express = require('express');
const router = express.Router();
const limit = require('../middleware/limit');

const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', limit.logincountlimiter, userCtrl.login);

module.exports = router;
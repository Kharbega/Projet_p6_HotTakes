const express = require('express');
const router = express.Router();
const limit = require('../middleware/limit');
const emailValidator = require('../middleware/email')
const passwordValidator = require('../middleware/password');

const userCtrl = require('../controllers/user');

router.post('/signup', emailValidator, passwordValidator, userCtrl.signup);
router.post('/login', limit.logincountlimiter, userCtrl.login);

module.exports = router;
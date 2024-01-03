const rateLimit = require('express-rate-limit')


const logincountlimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})
module.exports = { logincountlimiter }
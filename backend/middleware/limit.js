const rateLimit = require('express-rate-limit')


const logincountlimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})
//app.use(logincountlimiter)
module.exports = { logincountlimiter }
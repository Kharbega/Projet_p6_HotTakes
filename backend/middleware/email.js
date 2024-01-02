const emailValidator = require('email-validator');
const { body } = require('express-validator');


module.exports = (req, res, next) => {
    if (emailValidator.validate(email)) {
        return body("email")
            .isEmail()
            .withMessage("Please Enter A Valid Email")
            .isLength({ max: 320 })
            .withMessage("Password must contain up to 320 characters")
            .normalizeEmail();

    } else {
        return res.status(400).json({ error: `L'email ${email} n'est pas valide.` });
    }
};
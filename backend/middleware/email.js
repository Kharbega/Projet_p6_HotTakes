const emailValidator = require('email-validator');


module.exports = (req, res, next) => {
    const { email } = req.body;
    if (emailValidator.validate(email)) {
        next();

    } else {
        return res.status(400).json({ error: `L'email ${email} n'est pas valide.` });
    }
};
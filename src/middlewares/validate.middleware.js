const AppError = require('../utils/AppError');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        if (error) {
            const errorMessage = error.details[0].message;
            return next(new AppError(errorMessage, 400));
        }
        req.body = value;
        next();
    };
};

module.exports = validate;

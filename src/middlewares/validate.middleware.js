const AppError = require('../utils/AppError');

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source]);
        if (error) {
            const errorMessage = error.details[0].message;
            return next(new AppError(errorMessage, 400));
        }
        // Express 5 chỉ cung cấp getter cho req.query.
        if (source === 'query') Object.defineProperty(req, 'query', { value, configurable: true });
        else req.body = value;
        next();
    };
};

module.exports = validate;

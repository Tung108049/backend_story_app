const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,

    handler: (req, res, next) => {
        next(new AppError('Cảnh báo! Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút', 429));
    },

    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { loginLimiter };

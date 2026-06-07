const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('Lỗi 401: Không tìm thấy thẻ!', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Lỗi 401: Thẻ hết hạn hoặc không hợp lệ!', 401));
    }
};

module.exports = verifyToken;

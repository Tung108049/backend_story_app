const jwt = require('jsonwebtoken');
const AuthRepository = require('../modules/auth/auth.repository');
const AppError = require('../utils/AppError');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return next(new AppError('Vui lòng đăng nhập!', 401));
    let decoded;
    try {
        decoded = jwt.verify(authHeader.slice(7), process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    } catch (_) {
        return next(new AppError('Phiên đăng nhập đã hết hạn!', 401));
    }
    try {
        const user = await AuthRepository.getUserById(decoded.id);
        if (!user || user.deleted_at || user.status !== 'active' ||
            !user.refresh_token || user.refresh_token !== decoded.sessionHash) {
            return next(new AppError('Phiên đăng nhập không còn hợp lệ!', 401));
        }
        req.user = { id: user.id, role: user.role };
        next();
    } catch (error) { next(error); }
};

module.exports = verifyToken;

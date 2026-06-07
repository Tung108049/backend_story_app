const AppError = require('../utils/AppError');

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.role)) {
            return next(
                new AppError(
                    `Cảnh báo! Chỉ ${allowedRoles.join(' hoặc ')} được phép truy cập!`,
                    403
                )
            );
        }
        next();
    };
};

module.exports = checkRole;

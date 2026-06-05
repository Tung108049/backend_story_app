const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({
                message: 'Cảnh báo! Chỉ' + allowedRoles.join(' hoặc ') + 'mới được phép vào.'
            });
        }
        next();
    };
};

module.exports = checkRole;

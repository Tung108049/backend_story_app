const AppError = require('../../utils/AppError');
const UserService = require('./user.service');
const UserController = {
    getAllUsers: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await UserService.getAllUsers(page, limit);
            res.status(200).json({
                message: 'Lấy danh sách user thành công!',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    },

    updateAvatar: async (req, res, next) => {
        try {
            const file = req.file;
            if (!file) {
                return next(new AppError('Không tìm thấy ảnh!', 400));
            }
            const avatarUrl = file.path;
            const userId = req.user.id;
            await UserService.updateAvatar(userId, avatarUrl);

            res.status(200).json({
                message: 'Cập nhật thành công!',
                data: {
                    avatarUrl: avatarUrl
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = UserController;

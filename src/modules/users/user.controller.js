const AppError = require('../../utils/AppError');
const UserService = require('./user.service');
const UserController = {
    getUserById: async (req, res, next) => {
        try {
            const userId = req.params.id;
            const user = await UserService.getPublicUserById(userId);
            res.status(200).json({
                message: 'Lấy thông tin người dùng thành công!',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    getMyProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await UserService.getMyProfile(userId);
            res.status(200).json({
                message: 'Lấy thông tin cá nhân thành công!',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

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

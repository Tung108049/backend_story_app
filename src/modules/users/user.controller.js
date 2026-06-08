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
    }
};

module.exports = UserController;

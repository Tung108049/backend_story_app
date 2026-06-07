const AuthService = require('./auth.service');

const AuthController = {
    registerUser: async (req, res) => {
        try {
            await AuthService.registerUser(req.body);
            res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
        } catch (error) {
            next(error);
        }
    },

    loginUser: async (req, res) => {
        try {
            const { identifier, password } = req.body;
            const result = await AuthService.loginUser(username, email, password);
            res.status(200).json({
                message: 'Đăng nhập thành công!',
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            const result = await AuthService.refreshAccessToken(refreshToken);
            res.status(200).json({
                message: 'Refresh completed!',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = AuthController;

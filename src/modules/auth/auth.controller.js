const AuthService = require('./auth.service');

const AuthController = {
    registerUser: async (req, res) => {
        try {
            await AuthService.registerUser(req.body);
            res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await AuthService.loginUser(email, password);
            res.status(200).json({
                message: 'đăng nhập thành công!',
                data: result
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            const result = await AuthService.refreshAccessToken(refreshToken);
            res.status(200).json({
                message: 'refresh completed!',
                data: result
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
};

module.exports = AuthController;

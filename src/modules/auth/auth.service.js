const AuthRepository = require('./auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthService = {
    registerUser: async (userData) => {
        const { username, email, password } = userData;
        if (await AuthRepository.getUserByEmail(email)) {
            throw new Error('Email đã tồn tại!');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        return await AuthRepository.createUser(username, email, passwordHash);
    },

    loginUser: async (email, password) => {
        const user = await AuthRepository.getUserByEmail(email);
        if (!user) {
            throw new Error('Email không tồn tại!');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Sai mật khẩu!');
        }

        const payload = {
            id: user.id,
            email: user.email
        };

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.envJWT_REFRESH_SECRET, { expiresIn: '7d' });

        await AuthRepository.saveRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken,
            user: { id: user.id, username: user.username, email: user.email }
        };
    },

    refreshAccessToken: async (refreshTokenFromClient) => {
        if (!refreshTokenFromClient) {
            throw new Error('Không tìm thấy token!');
        }

        try {
            jwt.verify(refreshTokenFromClient, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new Error('Token không hợp lệ!');
        }

        const user = await AuthRepository.getUserByRefreshToken(refreshTokenFromClient);
        if (!user) {
            throw new Error('Token không hợp lệ hoặc đã bị thu hổi');
        }

        const payload = { id: user.id, email: user.email };
        const newAccessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '15m'
        });
        return { accessToken: newAccessToken };
    }
};

module.exports = AuthService;

const AuthRepository = require('./auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');

const AuthService = {
    registerUser: async (userData, avatarUrl = null) => {
        const { username, email, password } = userData;
        const existingUser = await AuthRepository.checkDuplicate(username, email);
        if (existingUser) {
            if (existingUser.email === email) {
                throw new AppError('Email đã được sử dụng!', 409);
            }
            if (existingUser.username === username) {
                throw new AppError('Tên người dùng đã được sử dụng!', 409);
            }
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const nickname = username;
        return await AuthRepository.createUser(username, email, passwordHash, nickname, avatarUrl);
    },

    loginUser: async (identifier, password) => {
        const user = await AuthRepository.getUserByIdentifier(identifier);
        if (!user) {
            throw new AppError('Email hoặc mật khẩu không chính xác!', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new AppError('Email hoặc mật khẩu không chính xác!', 401);
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        await AuthRepository.saveRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
    },

    refreshAccessToken: async (refreshTokenFromClient) => {
        if (!refreshTokenFromClient) {
            throw new AppError('Không tìm thấy Refresh Token!', 401);
        }

        try {
            jwt.verify(refreshTokenFromClient, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new AppError(
                'Refresh Token đã hết hạn hoặc không hợp lệ! Vui lòng thử lại!',
                401
            );
        }

        const user = await AuthRepository.getUserByRefreshToken(refreshTokenFromClient);
        if (!user) {
            throw new AppError('Token không hợp lệ hoặc tài khoản đã bị khoá!', 401);
        }

        const payload = { id: user.id, email: user.email, role: user.role };
        const newAccessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '15m'
        });
        return { accessToken: newAccessToken };
    },

    logoutUser: async (userId) => {
        await AuthRepository.clearRefreshToken(userId);
    }
};

module.exports = AuthService;

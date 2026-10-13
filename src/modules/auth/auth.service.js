const AuthRepository = require('./auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const AppError = require('../../utils/AppError');

const googleClient = new OAuth2Client();
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');

const AuthService = {
    registerUser: async (userData, avatarUrl = null) => {
        const { username, email, password } = userData;
        if (await AuthRepository.checkDuplicate(username, email)) {
            throw new AppError('Tên đăng nhập hoặc email đã được sử dụng!', 409);
        }
        const passwordHash = await bcrypt.hash(password, 10);
        return await AuthRepository.createUser(username, email, passwordHash, username, avatarUrl);
    },

    createSession: async user => {
        if (user.status !== 'active' || user.deleted_at) {
            throw new AppError('Tài khoản không còn hoạt động!', 403);
        }
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '7d', jwtid: crypto.randomUUID(), algorithm: 'HS256'
        });
        const sessionHash = hashToken(refreshToken);
        await AuthRepository.saveRefreshToken(user.id, sessionHash);
        const accessToken = jwt.sign({ id: user.id, sessionHash }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '15m', algorithm: 'HS256'
        });
        return { accessToken, refreshToken, user: {
            id: user.id, username: user.username, email: user.email,
            nickname: user.nickname, avatar_url: user.avatar_url, role: user.role
        } };
    },

    loginUser: async (identifier, password) => {
        const user = await AuthRepository.getUserByIdentifier(identifier);
        if (!user || !user.password_hash || !await bcrypt.compare(password, user.password_hash)) {
            throw new AppError('Tài khoản hoặc mật khẩu không chính xác!', 401);
        }
        return await AuthService.createSession(user);
    },

    loginGoogle: async (idToken, password) => {
        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new AppError('Server chưa cấu hình đăng nhập Google.', 503);
        }
        let profile;
        try {
            const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
            profile = ticket.getPayload();
        } catch (_) {
            throw new AppError('Thông tin đăng nhập Google không hợp lệ!', 401);
        }
        if (!profile || !profile.sub || !profile.email || !profile.email_verified) {
            throw new AppError('Google chưa xác minh email của tài khoản này!', 401);
        }
        const user = await AuthRepository.getOrCreateGoogleUser(profile, password);
        return await AuthService.createSession(user);
    },

    refreshAccessToken: async refreshToken => {
        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
        } catch (_) {
            throw new AppError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!', 401);
        }
        const sessionHash = hashToken(refreshToken);
        const user = await AuthRepository.getUserByRefreshToken(sessionHash);
        if (!user || user.id !== payload.id || user.status !== 'active' || user.deleted_at) {
            throw new AppError('Phiên đăng nhập không còn hợp lệ!', 401);
        }
        const accessToken = jwt.sign({ id: user.id, sessionHash }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '15m', algorithm: 'HS256'
        });
        return { accessToken };
    },

    logoutUser: async userId => { await AuthRepository.clearRefreshToken(userId); }
};

module.exports = AuthService;

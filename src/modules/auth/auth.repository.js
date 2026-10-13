const db = require('../../config/database');
const crypto = require('crypto');
const AppError = require('../../utils/AppError');

const AuthRepository = {
    getUserById: async id => {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    },

    getOrCreateGoogleUser: async profile => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [identities] = await connection.execute(`
                SELECT u.* FROM users u
                JOIN user_identities i ON i.user_id = u.id
                WHERE i.provider = 'google' AND i.provider_id = ?
            `, [profile.sub]);
            if (identities[0]) {
                await connection.commit();
                return identities[0];
            }
            const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [profile.email]);
            // Liên kết local cần xác minh riêng; không tự gộp theo email.
            if (existing.length) throw new AppError('Email đã có tài khoản. Hãy đăng nhập bằng mật khẩu.', 409);
            const username = 'google_' + crypto.createHash('sha256').update(profile.sub).digest('hex').slice(0, 24);
            const [result] = await connection.execute(`
                INSERT INTO users (username, email, nickname, avatar_url)
                VALUES (?, ?, ?, ?)
            `, [username, profile.email, (profile.name || profile.email).slice(0, 100), profile.picture || null]);
            await connection.execute(`
                INSERT INTO user_identities (user_id, provider, provider_id, provider_email)
                VALUES (?, 'google', ?, ?)
            `, [result.insertId, profile.sub, profile.email]);
            const [users] = await connection.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
            await connection.commit();
            return users[0];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
    createUser: async (username, email, password_hash, nickname, avatar_url) => {
        const query = `INSERT INTO users (username, email, password_hash, nickname, avatar_url)
                       VALUES(?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [
            username,
            email,
            password_hash,
            nickname,
            avatar_url
        ]);
        return result;
    },

    checkDuplicate: async (username, email) => {
        const query = `SELECT * FROM users WHERE username = ? OR email = ?`;
        const [rows] = await db.execute(query, [username, email]);
        return rows[0];
    },

    getUserByIdentifier: async (identifier) => {
        const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
        const [rows] = await db.execute(query, [identifier, identifier]);
        return rows[0];
    },

    saveRefreshToken: async (userId, refreshToken) => {
        const query = `UPDATE users 
                       SET refresh_token = ? 
                       WHERE id = ?`;
        await db.execute(query, [refreshToken, userId]);
    },

    getUserByRefreshToken: async (refreshToken) => {
        const query = `SELECT *
                       FROM users
                       WHERE refresh_token = ?`;
        const [rows] = await db.execute(query, [refreshToken]);
        return rows[0];
    },

    clearRefreshToken: async (userId) => {
        const query = `UPDATE users
                       SET refresh_token = ?
                       WHERE id = ?`;
        await db.execute(query, [null, userId]);
    }
};

module.exports = AuthRepository;

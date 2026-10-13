const db = require('../../config/database');
const crypto = require('crypto');
const AppError = require('../../utils/AppError');
const bcrypt = require('bcrypt');

const AuthRepository = {
    getUserById: async id => {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    },

    getOrCreateGoogleUser: async (profile, password) => {
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
            const [existing] = await connection.execute('SELECT * FROM users WHERE email = ? FOR UPDATE', [profile.email]);
            let userId;
            if (existing[0]) {
                const user = existing[0];
                if (user.status !== 'active' || user.deleted_at) throw new AppError('Tài khoản không còn hoạt động!', 403);
                if (!password) throw new AppError(
                    'Email Google đã có tài khoản trong app. Nhập mật khẩu tài khoản đó để liên kết.',
                    409, 'GOOGLE_LINK_REQUIRED'
                );
                if (!user.password_hash || !await bcrypt.compare(password, user.password_hash)) {
                    throw new AppError('Mật khẩu tài khoản trong app không đúng!', 401);
                }
                userId = user.id;
            } else {
                const username = 'google_' + crypto.createHash('sha256').update(profile.sub).digest('hex').slice(0, 24);
                const [result] = await connection.execute(`
                    INSERT INTO users (username, email, nickname, avatar_url)
                    VALUES (?, ?, ?, ?)
                `, [username, profile.email, (profile.name || profile.email).slice(0, 100), profile.picture || null]);
                userId = result.insertId;
            }
            await connection.execute(`
                INSERT INTO user_identities (user_id, provider, provider_id, provider_email)
                VALUES (?, 'google', ?, ?)
            `, [userId, profile.sub, profile.email]);
            const [users] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
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

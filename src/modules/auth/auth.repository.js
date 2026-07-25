const db = require('../../config/database');

const AuthRepository = {
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

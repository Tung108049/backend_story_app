const db = require('../../config/database');

const AuthRepository = {
    createUser: async (username, email, password_hash) => {
        const query = `INSERT INTO users (username, email, password_hash)
                       VALUES(?, ?, ?)`;
        const [rows] = await db.query(query, [username, email, password_hash]);
        return rows;
    },

    getUserByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(query, [email]);
        return rows[0];
    },

    saveRefreshToken: async (userId, refreshToken) => {
        const query = `UPDATE users 
                      SET refresh_token = ? 
                      WHERE id = ?`;
        await db.query(query, [refreshToken, userId]);
    },

    getUserByRefreshToken: async (refreshToken) => {
        const query = `SELECT *
                       FROM users
                       WHERE refresh_token = ?`;
        const [rows] = await db.query(query, [refreshToken]);
        return rows[0];
    }
};

module.exports = AuthRepository;

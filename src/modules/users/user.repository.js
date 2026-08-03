const db = require('../../config/database');

const UserRepository = {
    getAllUsers: async (limit, offset) => {
        const query = `SELECT id, username, email, role, avatar_url 
                           FROM users  
                           LIMIT ? OFFSET ?`;
        const [rows] = await db.execute(query, [limit, offset]);
        return rows;
    },

    countAllUsers: async () => {
        const [rows] = await db.execute('SELECT COUNT(*) as total FROM users');
        return rows[0].total;
    },

    updateAvatarUrl: async (userId, avatarUrl) => {
        const query = `UPDATE users SET avatar_url = ? WHERE id = ?`;
        await db.execute(query, [avatarUrl, userId]);
    },

    getPublicUserById: async (id) => {
        const query = `
            SELECT id, username, nickname, role, avatar_url, bio, gender, level, created_at 
            FROM users 
            WHERE id = ? AND deleted_at IS NULL
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0] || null;
    },

    getFullUserById: async (id) => {
        const query = `
            SELECT id, username, email, nickname, role, avatar_url, bio, dob, gender, coin, level, status, created_at 
            FROM users 
            WHERE id = ? AND deleted_at IS NULL
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0] || null;
    }
};
module.exports = UserRepository;

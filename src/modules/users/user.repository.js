const db = require('../../config/database');

const UserRepository = {
    getAllUsers: async (limit, offset) => {
        const query = `SELECT id, username, email, role, avatar_url 
                           FROM users  
                           LIMIT ? OFFSET ?`;
        const [rows] = await db.query(query, [limit, offset]);
        return rows;
    },

    countAllUsers: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM users');
        return rows[0].total;
    },

    updateAvatarUrl: async (userId, avatarUrl) => {
        const query = `UPDATE users SET avatar_url = ? WHERE id = ?`;
        await db.query(query, [avatarUrl, userId]);
    }
};
module.exports = UserRepository;

const db = require('../../config/database');

const UserRepository = {
    getAllUsersFromDB: async (limit, offset) => {
        try {
            const query = `SELECT id, username, email, role, avatar_url 
                           FROM users  
                           LIMIT ? OFFSET ?`;
            const [rows] = await db.query(query, [limit, offset]);
            return rows;
        } catch (error) {
            console.error('UserRepository.getAllUsersFromDB error:', error);
            throw new Error(`UserRepository.getAllUsersFromDB: ${error.message}`);
        }
    },

    countAllUsers: async () => {
        try {
            const [rows] = await db.query('SELECT COUNT(*) as total FROM users');
            return rows[0].total;
        } catch (error) {
            console.error('UserRepository.countAllUsers error:', error);
            throw new Error(`UserRepository.countAllUsers: ${error.message}`);
        }
    }
};

module.exports = UserRepository;

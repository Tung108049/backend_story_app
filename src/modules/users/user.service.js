const UserRepository = require('./user.repository');
const bcrypt = require('bcrypt');
const UserService = {
    getAllUsers: async (page, limit) => {
        const offset = (page - 1) * limit;
        const [users, total] = await Promise.all([
            UserRepository.getAllUsersFromDB(limit, offset),
            UserRepository.countAllUsers()
        ]);
        return {
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPage: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }
};

module.exports = UserService;

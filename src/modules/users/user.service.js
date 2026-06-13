const UserRepository = require('./user.repository');

const UserService = {
    getAllUsers: async (page, limit) => {
        const offset = (page - 1) * limit;
        const [users, total] = await Promise.all([
            UserRepository.getAllUsers(limit, offset),
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
    },

    updateAvatar: async (userId, avatarUrl) => {
        await UserRepository.updateAvatarUrl(userId, avatarUrl);
        return avatarUrl;
    }
};

module.exports = UserService;

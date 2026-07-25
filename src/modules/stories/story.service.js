const StoryRepository = require('./story.repository');
const AppError = require('../../utils/AppError');

const StoryService = {
    createStory: async (storyData, authorId) => {
        const { title, slug } = storyData;
        const existingStory = await StoryRepository.checkDuplicate(title, slug);
        if (existingStory) {
            throw new AppError('Tên truyện hoặc slug đã tồn tại!', 409);
        }

        const newStoryData = {
            ...storyData,
            author_id: authorId,
            cover_image_url: storyData.cover_image_url || null
        };
        const createdStory = await StoryRepository.createStory(newStoryData);

        return createdStory;
    },

    getStories: async (filters) => {
        return await StoryRepository.getStories(filters);
    }
};

module.exports = StoryService;

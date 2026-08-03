const StoryRepository = require('./story.repository');
const AppError = require('../../utils/AppError');

const StoryService = {
    createStory: async (storyData, authorId) => {
        const { title, slug, genre_ids, tag_ids } = storyData;
        const existingStory = await StoryRepository.checkDuplicate(title, slug);
        if (existingStory) {
            throw new AppError('Tên truyện hoặc slug đã tồn tại!', 409);
        }

        if (genre_ids && genre_ids.length > 0) {
            const isGenresValid = await StoryRepository.checkGenresExist(genre_ids);
            if (!isGenresValid) {
                throw new AppError('Một hoặc nhiều thể loại không tồn tại!', 400);
            }
        }

        if (tag_ids && tag_ids.length > 0) {
            const isTagsValid = await StoryRepository.checkTagsExist(tag_ids);
            if (!isTagsValid) {
                throw new AppError('Một hoặc nhiều thẻ không tồn tại!', 400);
            }
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

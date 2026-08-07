const StoryRepository = require('./story.repository');
const ChapterRepository = require('../chapter/chapter.repository');
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
    },

    getDetailStoryById: async (storyId) => {
        const commonStory = await StoryRepository.getDetailStoryById(storyId);
        if (!commonStory) {
            throw new AppError('Truyện không tồn tại!', 404);
        }
        
        const chapters = await ChapterRepository.getChaptersByStoryId(storyId);

        const data = {
            ...commonStory,
            chapters: chapters
        };

        return data;
    },

    getMyStories: async (authorId) => {
        return await StoryRepository.getMyStories(authorId);
    },

    updateStory: async (storyId, updateData, user) => {
        const story = await StoryRepository.getDetailStoryById(storyId);
        if (!story) {
            throw new AppError('Truyện không tồn tại!', 404);
        }

        // Check ownership
        if (user.role !== 'admin' && story.author_id !== user.id) {
            throw new AppError('Bạn không có quyền sửa truyện này!', 403);
        }

        if (updateData.genre_ids) {
            const genresExist = await StoryRepository.checkGenresExist(updateData.genre_ids);
            if (!genresExist) throw new AppError('Một số thể loại (genres) không tồn tại!', 400);
        }
        
        if (updateData.tag_ids) {
            const tagsExist = await StoryRepository.checkTagsExist(updateData.tag_ids);
            if (!tagsExist) throw new AppError('Một số nhãn (tags) không tồn tại!', 400);
        }

        await StoryRepository.updateStory(storyId, updateData);
        return { message: 'Cập nhật thông tin truyện thành công!' };
    },

    deleteStory: async (storyId, user) => {
        const story = await StoryRepository.getDetailStoryById(storyId);
        if (!story) {
            throw new AppError('Truyện không tồn tại!', 404);
        }

        // Check ownership
        if (user.role !== 'admin' && story.author_id !== user.id) {
            throw new AppError('Bạn không có quyền xóa truyện này!', 403);
        }

        await StoryRepository.deleteStory(storyId);
        return { message: 'Xóa truyện thành công!' };
    }
};

module.exports = StoryService;

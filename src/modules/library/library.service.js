const LibraryRepository = require('./library.repository');
const StoryService = require('../stories/story.service');
const ChapterRepository = require('../chapter/chapter.repository');
const AppError = require('../../utils/AppError');

const LibraryService = {
    getBookshelf: async userId => await LibraryRepository.getBookshelf(userId),
    addBookmark: async (userId, storyId) => {
        await StoryService.getDetailStoryById(storyId);
        await LibraryRepository.addBookmark(userId, storyId);
    },
    removeBookmark: async (userId, storyId) => await LibraryRepository.removeBookmark(userId, storyId),
    getHistory: async userId => await LibraryRepository.getHistory(userId),
    saveHistory: async (userId, chapterId) => {
        const chapter = await ChapterRepository.getChapterById(chapterId);
        if (!chapter || chapter.status !== 'published') throw new AppError('Chương không tồn tại!', 404);
        await StoryService.getDetailStoryById(chapter.story_id);
        await LibraryRepository.saveHistory(userId, chapter);
    },
    clearHistory: async userId => await LibraryRepository.clearHistory(userId)
};

module.exports = LibraryService;

const ChapterRepository = require('./chapter.repository');
const StoryRepository = require('../stories/story.repository');
const AppError = require('../../utils/AppError');
const db = require('../../config/database');

const ChapterService = {
    _getAndValidateStoryForChapter: async (storyId) => {
        const story = await StoryRepository.getDetailStoryById(storyId);
        if (!story) {
            throw new AppError('Truyện không tồn tại!', 404);
        }
        return story;
    },

    createChapter: async (storyId, chapterData) => {
        const story = await ChapterService._getAndValidateStoryForChapter(storyId);

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            let finalContent = null;
            if (story.content_type === 'novel') {
                if (chapterData.image_urls && chapterData.image_urls.length > 0) {
                    throw new AppError('Đây là tiểu thuyết (truyện chữ), không được phép thêm ảnh!', 400);
                }
                finalContent = chapterData.content || '';
            } else if (story.content_type === 'comic') {
                finalContent = null;
            }

            const newChapterData = {
                story_id: storyId,
                chapter_number: chapterData.chapter_number,
                title: chapterData.title,
                content: finalContent
            };
            const chapterId = await ChapterRepository.createChapterInfo(connection, newChapterData);

            if (story.content_type === 'comic' && chapterData.image_urls && chapterData.image_urls.length > 0) {
                await ChapterRepository.createChapterImages(connection, chapterId, chapterData.image_urls);
            }

            await connection.commit();
            return { id: chapterId, chapter_number: chapterData.chapter_number, title: chapterData.title };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = ChapterService;

const ChapterRepository = require('./chapter.repository');
const StoryRepository = require('../stories/story.repository');
const AppError = require('../../utils/AppError');
const db = require('../../config/database');

const ChapterService = {
    _getAndValidateStoryForChapter: async (storyId, user) => {
        const story = await StoryRepository.getDetailStoryById(storyId);
        if (!story) {
            throw new AppError('Truyện không tồn tại!', 404);
        }
        
        // Kiểm tra quyền (Chỉ admin hoặc tác giả mới được thao tác)
        if (user && user.role !== 'admin' && story.author_id !== user.id) {
            throw new AppError('Bạn không có quyền thao tác trên truyện này!', 403);
        }
        
        return story;
    },

    getChapterDetail: async (chapterId) => {
        const chapter = await ChapterRepository.getChapterById(chapterId);
        if (!chapter) throw new AppError('Chương truyện không tồn tại!', 404);
        
        const story = await ChapterService._getAndValidateStoryForChapter(chapter.story_id);
        
        let responseData = { ...chapter };
        
        // Nếu là truyện tranh thì lấy thêm mảng ảnh
        if (story.content_type === 'comic') {
            const images = await ChapterRepository.getChapterImagesByChapterId(chapterId);
            responseData.images = images;
        }

        return responseData;
    },

    createChapter: async (storyId, chapterData, user) => {
        const story = await ChapterService._getAndValidateStoryForChapter(storyId, user);

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
                content: finalContent,
                status: chapterData.status || 'draft'
            };
            const chapterId = await ChapterRepository.createChapterInfo(connection, newChapterData);

            if (story.content_type === 'comic' && chapterData.image_urls && chapterData.image_urls.length > 0) {
                await ChapterRepository.createChapterImages(connection, chapterId, chapterData.image_urls);
            }

            if (newChapterData.status === 'published' && story.published_at === null) {
                await StoryRepository.publishStory(storyId, connection);
            }

            await connection.commit();
            return { id: chapterId, chapter_number: chapterData.chapter_number, title: chapterData.title };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    updateChapter: async (chapterId, updateData, user) => {
        const chapter = await ChapterRepository.getChapterById(chapterId);
        if (!chapter) throw new AppError('Chương truyện không tồn tại!', 404);
        
        const story = await ChapterService._getAndValidateStoryForChapter(chapter.story_id, user);

        let newContent = undefined;
        if (story.content_type === 'novel') {
            if (updateData.content !== undefined) newContent = updateData.content;
        } else if (story.content_type === 'comic') {
            if (updateData.content !== undefined) {
                throw new AppError('Đây là truyện tranh, không được phép sửa nội dung chữ!', 400);
            }
        }

        const chapterUpdatePayload = {
            chapter_number: updateData.chapter_number,
            title: updateData.title,
            content: newContent,
            status: updateData.status
        };
        
        await ChapterRepository.updateChapterInfo(chapterId, chapterUpdatePayload);

        if (updateData.status === 'published' && story.published_at === null) {
            await StoryRepository.publishStory(chapter.story_id);
        }

        return { message: 'Cập nhật thông tin cơ bản thành công!' };
    },

    modifyComicImage: async (chapterId, action, pageNumber, imageUrl = null, user) => {
        const chapter = await ChapterRepository.getChapterById(chapterId);
        if (!chapter) throw new AppError('Chương truyện không tồn tại!', 404);
        
        const story = await ChapterService._getAndValidateStoryForChapter(chapter.story_id, user);
        
        if (story.content_type !== 'comic') {
            throw new AppError('Chỉ có thể sửa ảnh đối với truyện tranh!', 400);
        }

        const imageExists = await ChapterRepository.checkImageExists(chapterId, pageNumber);

        if (action === 'replace') {
            if (!imageExists) throw new AppError('Không tìm thấy ảnh tại page_number này để sửa!', 404);
            if (!imageUrl) throw new AppError('Cần cung cấp link ảnh mới để sửa!', 400);
            await ChapterRepository.updateChapterImage(chapterId, pageNumber, imageUrl);
            return { message: 'Cập nhật ảnh thành công!' };
        } 
        else if (action === 'insert') {
            if (imageExists) throw new AppError('Page_number này đã tồn tại ảnh, vui lòng chọn page_number trống!', 400);
            if (!imageUrl) throw new AppError('Cần cung cấp link ảnh mới để chèn!', 400);
            await ChapterRepository.insertChapterImage(chapterId, pageNumber, imageUrl);
            return { message: 'Chèn ảnh mới thành công!' };
        } 
        else if (action === 'delete') {
            if (!imageExists) throw new AppError('Không tìm thấy ảnh tại page_number này để xóa!', 404);
            await ChapterRepository.deleteChapterImage(chapterId, pageNumber);
            return { message: 'Xóa ảnh thành công!' };
        } 
        else {
            throw new AppError('Hành động không hợp lệ (chỉ hỗ trợ: replace, insert, delete)!', 400);
        }
    },

    deleteChapter: async(chapterId, user) => {
        const chapter = await ChapterRepository.getChapterById(chapterId);
        if (!chapter) throw new AppError('Chương truyện không tồn tại!', 404);
        
        await ChapterService._getAndValidateStoryForChapter(chapter.story_id, user);
        
        await ChapterRepository.deleteChapterById(chapterId);
        return { message: 'Xóa chương thành công!' };
    }

};

module.exports = ChapterService;

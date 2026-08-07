const StoryService = require('./story.service');

const StoryController = {
    createStory: async (req, res, next) => {
        try {
            const storyData = req.body;
            const authorId = req.user.id;
            const newStory = await StoryService.createStory(storyData, authorId);
            res.status(201).json({
                message: 'Tạo truyện mới thành công!',
                data: newStory
            });
        } catch (error) {
            next(error);
        }
    },

    getStories: async (req, res, next) => {
        try {
            const { content_type, sort_by, limit, page, keyword, genre_id, tag_id } = req.query;

            if (!content_type) {
                return res.status(400).json({
                    message: 'Vui lòng cung cấp loại truyện (content_type: novel hoặc comic)!'
                });
            }

            const filters = { content_type, sort_by, limit, page, keyword, genre_id, tag_id };
            const stories = await StoryService.getStories(filters);

            res.status(200).json({
                message: 'Lấy danh sách truyện thành công!',
                data: stories
            });
        } catch (error) {
            next(error);
        }
    },

    getDetailStory: async(req, res, next) => {
        try {
            const { storyId } = req.params;
            const story = await StoryService.getDetailStoryById(storyId);
            res.status(200).json({
                message: 'Lấy thông tin truyện thành công!',
                data: story
            });
        } catch (error) {
            next(error);
        }
    },

    getMyStories: async (req, res, next) => {
        try {
            const authorId = req.user.id;
            const stories = await StoryService.getMyStories(authorId);
            res.status(200).json({
                message: 'Lấy danh sách truyện của bạn thành công!',
                data: stories
            });
        } catch (error) {
            next(error);
        }
    },

    updateStory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            if (req.file) {
                updateData.cover_image_url = req.file.path;
            }

            const result = await StoryService.updateStory(id, updateData, req.user);
            res.status(200).json({ message: result.message });
        } catch (error) {
            next(error);
        }
    },

    deleteStory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await StoryService.deleteStory(id, req.user);
            res.status(200).json({ message: result.message });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = StoryController;

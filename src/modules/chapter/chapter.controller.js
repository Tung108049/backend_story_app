const ChapterService = require('./chapter.service');

const ChapterController = {
    createChapter: async (req, res, next) => {
        try {
            const { storyId } = req.params;
            const chapterData = { ...req.body };
            
            // Nếu có upload ảnh qua middleware thì lấy URL
            if (req.files && req.files.length > 0) {
                chapterData.image_urls = req.files.map(file => file.path);
            }
            
            const newChapter = await ChapterService.createChapter(storyId, chapterData);
            
            res.status(201).json({
                message: 'Tạo chương mới thành công!',
                data: newChapter
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = ChapterController;

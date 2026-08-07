const ChapterService = require('./chapter.service');

const ChapterController = {
    getChapterDetail: async (req, res, next) => {
        try {
            const { id } = req.params;
            const chapter = await ChapterService.getChapterDetail(id);
            
            res.status(200).json({
                message: 'Lấy chi tiết chương thành công!',
                data: chapter
            });
        } catch (error) {
            next(error);
        }
    },

    createChapter: async (req, res, next) => {
        try {
            const { storyId } = req.params;
            const chapterData = { ...req.body };
            
            // Nếu có upload ảnh qua middleware thì lấy URL
            if (req.files && req.files.length > 0) {
                chapterData.image_urls = req.files.map(file => file.path);
            }
            
            const newChapter = await ChapterService.createChapter(storyId, chapterData, req.user);
            
            res.status(201).json({
                message: 'Tạo chương mới thành công!',
                data: newChapter
            });
        } catch (error) {
            next(error);
        }
    },

    updateChapter: async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const result = await ChapterService.updateChapter(id, updateData, req.user);
            
            res.status(200).json({
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    },

    modifyComicImage: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { action, page_number } = req.body; // action: 'replace', 'insert', 'delete'
            
            if (!action || !page_number) {
                return res.status(400).json({ message: 'Thiếu action hoặc page_number' });
            }

            let imageUrl = null;
            if (action !== 'delete') {
                if (!req.file) {
                    return res.status(400).json({ message: 'Cần upload 1 file ảnh để thực hiện sửa/chèn!' });
                }
                imageUrl = req.file.path;
            }

            const result = await ChapterService.modifyComicImage(id, action, page_number, imageUrl, req.user);
            
            res.status(200).json({
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    },

    deleteChapter: async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await ChapterService.deleteChapter(id, req.user);
            res.status(200).json({
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = ChapterController;

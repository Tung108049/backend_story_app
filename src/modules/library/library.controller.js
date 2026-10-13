const LibraryService = require('./library.service');

const LibraryController = {
    getBookshelf: async (req, res, next) => {
        try { res.json({ data: await LibraryService.getBookshelf(req.user.id) }); }
        catch (error) { next(error); }
    },
    addBookmark: async (req, res, next) => {
        try {
            await LibraryService.addBookmark(req.user.id, req.body.story_id);
            res.status(201).json({ message: 'Đã thêm vào tủ sách!' });
        } catch (error) { next(error); }
    },
    removeBookmark: async (req, res, next) => {
        try {
            await LibraryService.removeBookmark(req.user.id, req.params.id);
            res.json({ message: 'Đã bỏ khỏi tủ sách!' });
        } catch (error) { next(error); }
    },
    getHistory: async (req, res, next) => {
        try { res.json({ data: await LibraryService.getHistory(req.user.id) }); }
        catch (error) { next(error); }
    },
    saveHistory: async (req, res, next) => {
        try {
            await LibraryService.saveHistory(req.user.id, req.body.chapter_id);
            res.json({ message: 'Đã lưu chương vừa đọc!' });
        } catch (error) { next(error); }
    },
    clearHistory: async (req, res, next) => {
        try {
            await LibraryService.clearHistory(req.user.id);
            res.json({ message: 'Đã xóa lịch sử đọc!' });
        } catch (error) { next(error); }
    }
};

module.exports = LibraryController;

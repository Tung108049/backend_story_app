const express = require('express');
const ChapterController = require('./chapter.controller');
const ChapterValidation = require('./chapter.validation');
const verifyToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { uploadChapterIMG } = require('../../middlewares/upload.middleware');

const router = express.Router();

// Lấy chi tiết nội dung 1 chapter (Public API cho người đọc)
router.get('/:id', ChapterController.getChapterDetail);

// Sửa thông tin cơ bản của chapter
router.put(
    '/:id',
    verifyToken,
    checkRole('moderator', 'admin'),
    validate(ChapterValidation.updateChapterSchema),
    ChapterController.updateChapter
);

// Thay thế/Chèn/Xóa 1 ảnh cụ thể trong truyện tranh
// Gửi lên body gồm: action ('replace', 'insert', 'delete') và page_number
// File đính kèm field name là 'image'
router.put(
    '/:id/images',
    verifyToken,
    checkRole('moderator', 'admin'),
    uploadChapterIMG.single('image'),
    validate(ChapterValidation.modifyComicImageSchema),
    ChapterController.modifyComicImage
);

//Xóa chapter
router.delete(
    '/:id',
    verifyToken,
    checkRole('moderator', 'admin'),
    ChapterController.deleteChapter
);

module.exports = router;

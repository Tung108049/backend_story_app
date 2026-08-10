const express = require('express');
const verifyToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const StoryValidation = require('./story.validation');
const StoryController = require('./story.controller');
const router = express.Router();
const ChapterController = require('../chapter/chapter.controller');
const ChapterValidation = require('../chapter/chapter.validation');
const { uploadChapterIMG, uploadStoryCover } = require('../../middlewares/upload.middleware');

//story
router.post(
    '/',
    verifyToken,
    checkRole('user', 'moderator', 'admin'),
    validate(StoryValidation.createStorySchema),
    StoryController.createStory
);

router.get('/', StoryController.getStories);

router.get(
    '/my-stories',
    verifyToken,
    checkRole('user', 'moderator', 'admin'),
    StoryController.getMyStories
);

router.get(
    '/:storyId',
    StoryController.getDetailStory
);

// Sửa truyện
router.put(
    '/:id',
    verifyToken,
    checkRole('user', 'moderator', 'admin'),
    uploadStoryCover.single('cover_image'),
    validate(StoryValidation.updateStorySchema),
    StoryController.updateStory
);

// Xóa truyện (Soft Delete)
router.delete(
    '/:id',
    verifyToken,
    checkRole('user', 'moderator', 'admin'),
    StoryController.deleteStory
);

//chapter
router.post(
    '/:storyId/chapters',
    verifyToken,
    checkRole('user', 'moderator', 'admin'),
    uploadChapterIMG.array('images', 50),
    validate(ChapterValidation.createChapterSchema),
    ChapterController.createChapter
);

module.exports = router;

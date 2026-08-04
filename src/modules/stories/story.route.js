const express = require('express');
const verifyToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const StoryValidation = require('./story.validation');
const StoryController = require('./story.controller');
const router = express.Router();
const ChapterController = require('../chapter/chapter.controller');
const ChapterValidation = require('../chapter/chapter.validation');
const { uploadChapterIMG } = require('../../middlewares/upload.middleware');

//story
router.post(
    '/',
    verifyToken,
    checkRole('moderator', 'admin'),
    validate(StoryValidation.createStorySchema),
    StoryController.createStory
);

router.get('/', StoryController.getStories);

//chapter
router.post(
    '/:storyId/chapters',
    verifyToken,
    checkRole('moderator', 'admin'),
    uploadChapterIMG.array('images', 50),
    validate(ChapterValidation.createChapterSchema),
    ChapterController.createChapter
);

module.exports = router;

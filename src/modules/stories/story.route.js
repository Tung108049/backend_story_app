const express = require('express');
const verifyToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const StoryValidation = require('./story.validation');
const StoryController = require('./story.controller');
const router = express.Router();
router.post(
    '/',
    verifyToken,
    checkRole('moderator', 'admin'),
    validate(StoryValidation.createStorySchema),
    StoryController.createStory
);

router.get('/', StoryController.getStories);

module.exports = router;

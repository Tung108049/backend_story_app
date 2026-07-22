const express = require('express');
const TagController = require('./tag.controller');
const verifyToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const TagValidation = require('./tag.validation');
const router = express.Router();

router.get('/', TagController.getAllTags);

router.post(
    '/',
    verifyToken,
    checkRole('moderator', 'admin'),
    validate(TagValidation.createTagSchema),
    TagController.createTag
);

module.exports = router;

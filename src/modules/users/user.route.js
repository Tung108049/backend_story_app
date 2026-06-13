const express = require('express');
const UserController = require('./user.controller');
const verifyToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const { uploadAvatar } = require('../../middlewares/upload.middleware');

const router = express.Router();

router.put(
    '/update-avatar',
    verifyToken,
    uploadAvatar.single('avatar'),
    UserController.updateAvatar
);
router.get('/', verifyToken, checkRole('admin', 'moderator'), UserController.getAllUsers);

module.exports = router;

const express = require('express');
const AuthController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const AuthValidation = require('./auth.validation');
const verifyToken = require('../../middlewares/auth.middleware');
const { loginLimiter } = require('../../middlewares/limiter.middware');
const { uploadAvatar } = require('../../middlewares/upload.middleware');
const router = express.Router();

router.post('/register', uploadAvatar.single('avatar'), validate(AuthValidation.registerSchema), AuthController.registerUser);

router.post('/login', loginLimiter, validate(AuthValidation.loginSchema), AuthController.loginUser);

router.post('/refresh', AuthController.refreshToken);

router.post('/logout', verifyToken, AuthController.logoutUser);

module.exports = router;

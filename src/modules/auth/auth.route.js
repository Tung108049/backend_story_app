const express = require('express');
const AuthController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const AuthValidation = require('./auth.validation');
const router = express.Router();

router.post('/register', validate(AuthValidation.registerSchema), AuthController.registerUser);

router.post('/login', AuthController.loginUser);

router.post('/refresh', AuthController.refreshToken);

module.exports = router;

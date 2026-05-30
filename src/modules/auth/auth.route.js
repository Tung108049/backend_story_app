const express = require('express');
const AuthController = require('./auth.controller');
const router = express.Router();

router.post('/register', AuthController.registerUser);

router.post('/login', AuthController.loginUser);

router.post('/refresh', AuthController.refreshToken);

module.exports = router;

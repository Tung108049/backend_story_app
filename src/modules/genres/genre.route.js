const express = require('express');
const verifyToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const GenreController = require('./genre.controller');
const GenreValidation = require('./genre.validation');
const router = express.Router();

router.get('/', GenreController.getAllGenre);

router.post(
    '/',
    verifyToken,
    checkRole('moderator', 'admin'),
    validate(GenreValidation.createGenreSchema),
    GenreController.createGenre
);

module.exports = router;

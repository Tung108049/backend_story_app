const express = require('express');
const Joi = require('joi');
const verifyToken = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const LibraryController = require('./library.controller');
const router = express.Router();

router.use(verifyToken);
router.get('/bookshelf', LibraryController.getBookshelf);
router.post('/bookshelf', validate(Joi.object({ story_id: Joi.number().integer().positive().required() })), LibraryController.addBookmark);
router.delete('/bookshelf/:id', LibraryController.removeBookmark);
router.get('/history', LibraryController.getHistory);
router.put('/history', validate(Joi.object({ chapter_id: Joi.number().integer().positive().required() })), LibraryController.saveHistory);
router.delete('/history', LibraryController.clearHistory);

module.exports = router;

const Joi = require('joi');

const ChapterValidation = {
    createChapterSchema: Joi.object({
        chapter_number: Joi.number().min(0).required().messages({
            'number.base': 'Số chương phải là một số',
            'number.min': 'Số chương không được âm',
            'any.required': 'Số chương là bắt buộc'
        }),
        title: Joi.string().max(255).allow('', null).messages({
            'string.max': 'Tiêu đề không được vượt quá 255 ký tự'
        }),
        content: Joi.string().allow('', null)
    })
};

module.exports = ChapterValidation;

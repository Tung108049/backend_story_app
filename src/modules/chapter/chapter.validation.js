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
        content: Joi.string().allow('', null),
        status: Joi.string().valid('draft', 'published').default('draft')
    }),
    
    updateChapterSchema: Joi.object({
        chapter_number: Joi.number().min(0).messages({
            'number.base': 'Số chương phải là một số',
            'number.min': 'Số chương không được âm'
        }),
        title: Joi.string().max(255).allow('', null).messages({
            'string.max': 'Tiêu đề không được vượt quá 255 ký tự'
        }),
        content: Joi.string().allow('', null),
        status: Joi.string().valid('draft', 'published')
    }),

    modifyComicImageSchema: Joi.object({
        action: Joi.string().valid('replace', 'insert', 'delete').required().messages({
            'any.only': 'Hành động không hợp lệ',
            'any.required': 'Vui lòng cung cấp hành động (action)'
        }),
        page_number: Joi.number().integer().positive().required().messages({
            'number.base': 'Số trang (page_number) phải là một số',
            'number.positive': 'Số trang phải lớn hơn 0',
            'any.required': 'Vui lòng cung cấp số trang'
        })
    })
};

module.exports = ChapterValidation;

const Joi = require('joi');
const AuthValidation = {
    registerSchema: Joi.object({
        username: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z0-9__-]+$/)
            .min(3)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Tên đăng nhập không được để trống',
                'string.pattern.base': 'Tên đăng nhập chỉ dc chứa chữ, số, -, _',
                'string.min': 'Tên đăng nhập cần chứa ít nhất 3 kí tự!',
                'string.max': 'Tên đăng nhập quá dài!'
            }),

        email: Joi.string().trim().email().required().messages({
            'string.empty': 'Email không được để trống!',
            'string.email': 'Email không hợp lệ!'
        }),
        password: Joi.string().trim().min(6).max(100).required().messages({
            'string.empty': 'Mật khẩu không được để trống!',
            'string.min': 'Mật khẩu quá ngắn!',
            'string.max': 'Mật khẩu quá dài!'
        })
    }),

    loginSchema: Joi.object({
        identifier: Joi.string().trim().required().messages({
            'string.empty': 'Vui lòng nhập Tên đăng nhập hoặc Email!',
            'any.required': 'Vui lòng nhập Tên đăng nhập hoặc Email!'
        }),

        password: Joi.string().trim().required().messages({
            'string.empty': 'Vui lòng nhập mật khẩu!',
            'any.required': 'Vui lòng nhập mật khẩu!'
        })
    })
};

module.exports = AuthValidation;

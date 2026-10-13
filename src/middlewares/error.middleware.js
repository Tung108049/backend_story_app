const errorHandler = (err, req, res, next) => {
    const statusCode = err.code === 'ER_DUP_ENTRY' ? 409 :
        err.code === 'LIMIT_FILE_SIZE' ? 413 :
        err.code?.startsWith('LIMIT_') ? 400 : (err.status || err.statusCode || 500);
    if (statusCode >= 500) console.error('Lỗi server:', err.code || err.name);
    res.status(statusCode).json({
        message: statusCode >= 500 ? 'Server gặp lỗi, vui lòng thử lại sau!' :
            err.code === 'ER_DUP_ENTRY' ? 'Dữ liệu đã tồn tại!' :
            statusCode === 413 ? 'Ảnh không được vượt quá 10 MB!' : err.message,
        code: err.code === 'GOOGLE_LINK_REQUIRED' ? err.code : undefined
    });
};

module.exports = errorHandler;

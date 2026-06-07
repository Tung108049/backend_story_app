const errorHandler = (err, req, res, next) => {
    console.error('PHÁT HIỆN LỖI! -> ', err.stack);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Server hiện đang bảo trì, vui lòng thử lại sau!',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};

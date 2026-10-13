const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createUploader = (folderName, transformation = []) => {
    // Multer nhận stream ảnh, Cloudinary trả URL; không lưu file lên ổ đĩa.
    const storage = {
        _handleFile: (req, file, callback) => {
            const stream = cloudinary.uploader.upload_stream({
                folder: folderName, resource_type: 'image',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                transformation
            }, (error, result) => {
                if (error) return callback(error);
                callback(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
            });
            file.stream.on('error', error => stream.destroy(error));
            file.stream.pipe(stream);
        },
        _removeFile: (req, file, callback) => {
            cloudinary.uploader.destroy(file.filename).then(() => callback(null)).catch(callback);
        }
    };
    return multer({ storage, limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
                const error = new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.');
                error.statusCode = 400;
                return callback(error);
            }
            callback(null, true);
        }
    });
};
const uploadAvatar = createUploader('app_truyen/avatars', [
    { width: 500, height: 500, crop: 'fill' }
]);
const uploadStoryCover = createUploader('app_truyen/story_covers', [
    { width: 600, height: 800, crop: 'fill' }
]);
const uploadChapterIMG = createUploader('app_truyen/chapter_images', [
    { width: 1080, crop: 'limit' }
]);

module.exports = {
    uploadAvatar,
    uploadStoryCover,
    uploadChapterIMG
};

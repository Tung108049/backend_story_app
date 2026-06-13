const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createUploader = (folderName, transformation = []) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: folderName,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: transformation
        }
    });
    return multer({ storage });
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

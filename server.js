require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/demo', express.static(require('path').join(__dirname, 'public/demo')));

const userRoutes = require('./src/modules/users/user.route');
const authRoutes = require('./src/modules/auth/auth.route');
const genreRoutes = require('./src/modules/genres/genre.route');
const tagRoutes = require('./src/modules/tags/tag.route');
const storyRoutes = require('./src/modules/stories/story.route');
const chapterRoutes = require('./src/modules/chapter/chapter.route');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/library', require('./src/modules/library/library.route'));

app.get('/api/ping', (req, res) => {
    res.status(200).json({
        message: 'Server App Truyện đang chạy! '
    });
});

const errorHandler = require('./src/middlewares/error.middleware');
app.use((req, res) => res.status(404).json({ message: 'API không tồn tại!' }));
app.use(errorHandler);

if (require.main === module) {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server đã mở tại cổng ${port}`);
    });
}

module.exports = app;

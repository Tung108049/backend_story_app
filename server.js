require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const userRoutes = require('./src/modules/users/user.route');
const authRoutes = require('./src/modules/auth/auth.route');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
//
app.get('/api/ping', (req, res) => {
    res.status(200).json({
        message: 'Server App Truyện đang chạy! '
    });
});

app.listen(port, () => {
    console.log(`Server đã mở: http:localhost:${port}`);
});

require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const userRoutes = require('./src/modules/users/user.route');
app.use('/api/users', userRoutes);
app.get('/api/ping', (req, res) => {
    res.status(200).json({
        message: 'Server App Truyện đang chạy ngon lành cành đào! '
    });
});

app.listen(port, () => {
    console.log(`Server đã mở: http:localhost:${port}`);
});

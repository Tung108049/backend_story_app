# Backend Story App

Dự án Backend cho hệ thống đọc truyện online.

## Công nghệ sử dụng

- Node.js
- Express.js
- MySQL

## Cấu trúc dự án
src/  
├── config/       # Cấu hình database
│   ├── database.js
│   └── cloudinary.js
│
├── middlewares/  # Middleware
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── upload.middleware.js
│   ├── limiter.middware.js
│   └── errorHandler.middleware.js
│
├── modules/   
│   ├── auth/     
│   ├── users/   
│   ├── stories/  
│   └── chapters/ 
│
├── utils/        # Các helper utilities
│   ├── AppError.js
│
└── server.js     # Điểm bắt đầu ứng dụng

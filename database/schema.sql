CREATE DATABASE IF NOT EXISTS story_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; -- Xây cái ngăn chứa tên là story_db
USE story_db;
-- ========================================================
-- 1. BẢNG NGƯỜI DÙNG (Hồ sơ gốc - Đã bao gồm Ngày sinh, Giới tính)
-- ========================================================
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    -- Bắt buộc username chỉ gồm chữ, số và gạch dưới (Chống hack)
    username      VARCHAR(50) UNIQUE NOT NULL CHECK (username REGEXP '^[a-zA-Z0-9_]+$'),
    email         VARCHAR(255) UNIQUE NULL,      -- NULL nếu user không cung cấp
    refresh_token VARCHAR(255) NULL,
    password_hash VARCHAR(255) NULL,             -- NULL nếu đăng nhập bằng Google
    nickname      VARCHAR(100) NOT NULL,
    role          ENUM('user', 'moderator', 'admin') DEFAULT 'user',
    avatar_url    VARCHAR(500) NULL,
    bio           TEXT NULL,
    dob           DATE NULL,                     -- Ngày sinh (Tùy chọn)
    gender        ENUM('male', 'female', 'other', 'secret') DEFAULT 'secret', -- Giới tính
    coin          INT DEFAULT 0 CHECK (coin >= 0),
    level         INT DEFAULT 1,
    status        ENUM('active', 'banned') DEFAULT 'active',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    TIMESTAMP NULL
);

-- ========================================================
-- 2. BẢNG DANH TÍNH (Thẻ thông hành Google/Facebook)
-- ========================================================
CREATE TABLE IF NOT EXISTS user_identities (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    provider        ENUM('local', 'google', 'facebook', 'github') NOT NULL,
    provider_id     VARCHAR(255) NOT NULL,  -- ID mã số mạng xã hội cấp
    provider_email  VARCHAR(255) NULL,      -- Email đi kèm (nếu có)
    -- Đã vứt bỏ các cột token theo chuẩn bảo mật
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_provider (provider, provider_id)  -- Chống nhân bản nick
);

-- Index tăng tốc đăng nhập
CREATE INDEX idx_identities_user     ON user_identities(user_id);
CREATE INDEX idx_identities_provider ON user_identities(provider, provider_id);

-- ========================================================
-- 3. BẢNG KHO TRUYỆN (Sạch sẽ, Tối ưu hóa Tiền tệ)
-- ========================================================
CREATE TABLE IF NOT EXISTS stories (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    cover_image_url VARCHAR(500),
    author_id       INT NOT NULL,
    status          ENUM('ongoing', 'completed', 'dropped') DEFAULT 'ongoing',
    content_type    ENUM('novel', 'comic') DEFAULT 'novel',
    views_count     INT DEFAULT 0,
    rating_count    INT DEFAULT 0,
    average_rating  DECIMAL(3,2) DEFAULT 0.00,
    published_at    TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    
    -- Chặn xóa User nếu User đó đang có truyện (Chống sập app)
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Index tăng tốc load trang chủ
CREATE INDEX idx_stories_slug      ON stories(slug);
CREATE INDEX idx_stories_author    ON stories(author_id);
CREATE INDEX idx_stories_status    ON stories(status);
CREATE INDEX idx_stories_published ON stories(published_at);


USE story_db;
CREATE INDEX idx_stories_content_type ON stories(content_type);
CREATE INDEX idx_stories_views ON stories(views_count);
ALTER TABLE stories ADD FULLTEXT INDEX ft_stories_title (title);
-- ========================================================
-- 4. BẢNG CHƯƠNG TRUYỆN (Dùng chung cho cả Truyện chữ & Truyện tranh)
-- ========================================================
CREATE TABLE IF NOT EXISTS chapters (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    story_id       INT NOT NULL,
    chapter_number DECIMAL(5,1) NOT NULL,
    title          VARCHAR(255) NULL,
    content        LONGTEXT NULL,
    status         ENUM('draft', 'published') DEFAULT 'draft',
    views_count    INT DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    UNIQUE KEY uq_chapter_number (story_id, chapter_number)
);

CREATE INDEX idx_chapters_story  ON chapters(story_id);
CREATE INDEX idx_chapters_number ON chapters(chapter_number);

-- ========================================================
-- 5. BẢNG ẢNH TRUYỆN TRANH (Chỉ dùng cho comic)
-- ========================================================

CREATE TABLE IF NOT EXISTS chapter_images (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id  INT NOT NULL,
    image_url   VARCHAR(500) NOT NULL,
    page_number INT NOT NULL,

    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE KEY uq_page_number (chapter_id, page_number)
);

CREATE INDEX idx_images_chapter ON chapter_images(chapter_id);

USE story_db;

-- ========================================================
-- 6. BẢNG THỂ LOẠI (Genre - Do Admin quản lý)
-- ========================================================
CREATE TABLE IF NOT EXISTS genres (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) UNIQUE NOT NULL,   -- VD: Tiên hiệp, Romance
    slug       VARCHAR(100) UNIQUE NOT NULL,   -- VD: tien-hiep, romance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 7. BẢNG NHÃN (Tag - Linh hoạt hơn Genre)
-- ========================================================
CREATE TABLE IF NOT EXISTS tags (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) UNIQUE NOT NULL,   -- VD: xuyên không, bá đạo
    slug       VARCHAR(100) UNIQUE NOT NULL,   -- VD: xuyen-khong, ba-dao
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 8. BẢNG TRUNG GIAN: TRUYỆN ↔ THỂ LOẠI
-- ========================================================
CREATE TABLE IF NOT EXISTS story_genres (
    story_id  INT NOT NULL,
    genre_id  INT NOT NULL,

    PRIMARY KEY (story_id, genre_id),          -- Chống gắn trùng genre
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- ========================================================
-- 9. BẢNG TRUNG GIAN: TRUYỆN ↔ NHÃN
-- ========================================================
CREATE TABLE IF NOT EXISTS story_tags (
    story_id INT NOT NULL,
    tag_id   INT NOT NULL,

    PRIMARY KEY (story_id, tag_id),            -- Chống gắn trùng tag
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)   REFERENCES tags(id) ON DELETE CASCADE
);

-- Index để lọc truyện theo thể loại và nhãn
CREATE INDEX idx_story_genres_genre ON story_genres(genre_id);
CREATE INDEX idx_story_tags_tag     ON story_tags(tag_id);



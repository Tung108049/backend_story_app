-- Schema cuối cùng, chạy lại không xóa dữ liệu.
CREATE DATABASE IF NOT EXISTS story_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE story_db;

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL CHECK (username REGEXP '^[a-zA-Z0-9_]+$'),
    email         VARCHAR(255) UNIQUE NULL,
    refresh_token VARCHAR(255) NULL,
    password_hash VARCHAR(255) NULL,
    nickname      VARCHAR(100) NOT NULL,
    role          ENUM('user', 'moderator', 'admin') DEFAULT 'user',
    avatar_url    VARCHAR(500) NULL,
    bio           TEXT NULL,
    dob           DATE NULL,
    gender        ENUM('male', 'female', 'other', 'secret') DEFAULT 'secret',
    coin          INT DEFAULT 0 CHECK (coin >= 0),
    level         INT DEFAULT 1,
    status        ENUM('active', 'banned') DEFAULT 'active',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS user_identities (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    provider        ENUM('local', 'google', 'facebook', 'github') NOT NULL,
    provider_id     VARCHAR(255) NOT NULL,
    provider_email  VARCHAR(255) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_provider (provider, provider_id)
);

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

    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_stories_published (published_at),
    INDEX idx_stories_content_type (content_type),
    INDEX idx_stories_views (views_count),
    INDEX idx_stories_status (status),
    FULLTEXT INDEX ft_stories_title (title)
);

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
    UNIQUE KEY uq_chapter_number (story_id, chapter_number),
    INDEX idx_chapters_number (chapter_number)
);

CREATE TABLE IF NOT EXISTS chapter_images (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id  INT NOT NULL,
    image_url   VARCHAR(500) NOT NULL,
    page_number INT NOT NULL,

    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE KEY uq_page_number (chapter_id, page_number),
    INDEX idx_images_chapter (chapter_id)
);

CREATE TABLE IF NOT EXISTS genres (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) UNIQUE NOT NULL,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) UNIQUE NOT NULL,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_genres (
    story_id  INT NOT NULL,
    genre_id  INT NOT NULL,

    PRIMARY KEY (story_id, genre_id),
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE,
    INDEX idx_story_genres_genre (genre_id)
);

CREATE TABLE IF NOT EXISTS story_tags (
    story_id INT NOT NULL,
    tag_id   INT NOT NULL,

    PRIMARY KEY (story_id, tag_id),
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)   REFERENCES tags(id) ON DELETE CASCADE
);

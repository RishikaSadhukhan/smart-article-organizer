-- ============================================================
-- Smart Article Organizer - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_article_organizer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_article_organizer;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL DEFAULT '',
  institution   VARCHAR(200) DEFAULT NULL,
  bio           TEXT         DEFAULT NULL,
  avatar_color  VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email    (email),
  INDEX idx_users_username (username)
) ENGINE=InnoDB;

-- ============================================================
-- Table: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT         DEFAULT NULL,
  color       VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  icon        VARCHAR(50)  NOT NULL DEFAULT 'folder',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_category_user_name (user_id, name),
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_categories_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- Table: articles
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  title               VARCHAR(500) NOT NULL,
  abstract            TEXT         DEFAULT NULL,
  authors             VARCHAR(500) DEFAULT NULL,
  publication_year    YEAR         DEFAULT NULL,
  journal_conference  VARCHAR(300) DEFAULT NULL,
  keywords            TEXT         DEFAULT NULL,
  notes               TEXT         DEFAULT NULL,
  pdf_filename        VARCHAR(255) DEFAULT NULL,
  pdf_original_name   VARCHAR(255) DEFAULT NULL,
  pdf_size            BIGINT       DEFAULT NULL,
  doi                 VARCHAR(200) DEFAULT NULL,
  url                 VARCHAR(500) DEFAULT NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_articles_user        (user_id),
  INDEX idx_articles_year        (publication_year),
  FULLTEXT INDEX ft_articles_search (title, authors, keywords, abstract)
) ENGINE=InnoDB;

-- ============================================================
-- Table: article_categories  (Many-to-Many)
-- ============================================================
CREATE TABLE IF NOT EXISTS article_categories (
  article_id  INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  assigned_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (article_id, category_id),
  CONSTRAINT fk_ac_article  FOREIGN KEY (article_id)  REFERENCES articles(id)   ON DELETE CASCADE,
  CONSTRAINT fk_ac_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_ac_category (category_id)
) ENGINE=InnoDB;

-- ============================================================
-- Table: favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  article_id INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorites (user_id, article_id),
  CONSTRAINT fk_favorites_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_favorites_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- Table: activity_log
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  action     VARCHAR(50)  NOT NULL,
  entity     VARCHAR(50)  NOT NULL DEFAULT 'article',
  entity_id  INT UNSIGNED DEFAULT NULL,
  detail     VARCHAR(500) DEFAULT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activity_user (user_id),
  INDEX idx_activity_time (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- Sample Data (Optional - for testing)
-- ============================================================

-- Insert a demo user (password: Demo@1234)
INSERT INTO users (username, email, password_hash, full_name, institution, avatar_color)
VALUES (
  'demo',
  'demo@example.com',
  '$2b$10$X7o4c9xOGAFBhxCGgCEw7.4P1isMdX2X3iBfzf1D0QKDf3T0a8MKm',
  'Demo Researcher',
  'State University',
  '#6366f1'
);

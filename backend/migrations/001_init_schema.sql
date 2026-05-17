-- Cross-border E-commerce Database Migrations
-- First version - Initial schema

-- Create the database
CREATE DATABASE IF NOT EXISTS ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce;

-- ============================================
-- Users & Authentication
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at BIGINT,
    updated_at BIGINT,
    deleted_at DATETIME NULL,
    UNIQUE KEY uk_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NULL,
    phone VARCHAR(50) NULL,
    country VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    district VARCHAR(100) NULL,
    street VARCHAR(500) NULL,
    zip_code VARCHAR(20) NULL,
    is_default TINYINT(1) DEFAULT 0,
    created_at BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Products & Categories
-- ============================================
CREATE TABLE IF NOT EXISTS product_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NULL,
    parent_id BIGINT UNSIGNED NULL,
    image_url VARCHAR(500) NULL,
    status VARCHAR(50) DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at BIGINT,
    updated_at BIGINT,
    UNIQUE KEY uk_slug (slug),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NULL,
    description TEXT NULL,
    short_desc VARCHAR(500) NULL,
    category_id BIGINT UNSIGNED NULL,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2) NULL,
    stock INT DEFAULT 0,
    weight DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    images JSON NULL,
    is_featured TINYINT(1) DEFAULT 0,
    meta_title VARCHAR(500) NULL,
    meta_desc TEXT NULL,
    created_at BIGINT,
    updated_at BIGINT,
    UNIQUE KEY uk_slug (slug),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_skus (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NULL,
    code VARCHAR(255) NULL,
    price DECIMAL(10,2) NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(500) NULL,
    sort_order INT DEFAULT 0,
    created_at BIGINT,
    UNIQUE KEY uk_code (code),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Carts & Orders
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at BIGINT,
    updated_at BIGINT,
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    sku_id BIGINT UNSIGNED NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at BIGINT,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(100) NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255) NULL,
    shipping_name VARCHAR(100) NULL,
    shipping_phone VARCHAR(50) NULL,
    shipping_country VARCHAR(100) NULL,
    shipping_state VARCHAR(100) NULL,
    shipping_city VARCHAR(100) NULL,
    shipping_street VARCHAR(500) NULL,
    shipping_zip_code VARCHAR(20) NULL,
    note TEXT NULL,
    created_at BIGINT,
    updated_at BIGINT,
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL,
    sku_id BIGINT UNSIGNED NULL,
    product_title VARCHAR(255) NULL,
    sku_code VARCHAR(255) NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500) NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_histories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(50) NULL,
    note TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at BIGINT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Admin & Security
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NULL,
    avatar VARCHAR(500) NULL,
    role VARCHAR(50) DEFAULT 'operator',
    status VARCHAR(50) DEFAULT 'active',
    last_login BIGINT NULL,
    created_at BIGINT,
    updated_at BIGINT,
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Promotions
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'percent',
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) NULL,
    max_discount DECIMAL(10,2) NULL,
    usage_limit INT DEFAULT 0,
    usage_count INT DEFAULT 0,
    starts_at BIGINT NULL,
    expires_at BIGINT NULL,
    status VARCHAR(50) DEFAULT 'active',
    description TEXT NULL,
    created_at BIGINT,
    UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Initial Admin User (for setup)
-- Password: admin123 (hashed with bcrypt)
-- ============================================
INSERT INTO admin_users (id, username, email, password, name, role, status, created_at, updated_at)
VALUES (1, 'admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL1lh9Lq', 'System Admin', 'super_admin', 'active', UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(NOW()));

-- ============================================
-- Insert some sample categories
-- ============================================
INSERT INTO product_categories (name, slug, status, sort_order, created_at, updated_at) VALUES
('Electronics', 'electronics', 'active', 1, UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(NOW())),
('Fashion', 'fashion', 'active', 2, UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(NOW())),
('Home & Living', 'home-living', 'active', 3, UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(NOW())),
('Sports & Outdoors', 'sports', 'active', 4, UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(NOW()));

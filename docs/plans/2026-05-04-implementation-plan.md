# 跨境电商独立站 - 详细实现计划

> **版本**: 1.0  
> **日期**: 2026-05-04  
> **基于架构设计文档**: docs/specs/2026-05-04-cross-border-ecommerce-design.md

---

## 文档概述

本文档为跨境电商独立站的详细实现计划，按照架构设计分为四个阶段：
- **Phase 1**: 核心功能 (MVP)
- **Phase 2**: 交易闭环
- **Phase 3**: 管理后台
- **Phase 4**: 增值功能

---

# Phase 1: 核心功能 (MVP)

## 项目结构总览

```
cross-border-ecommerce-site/
├── backend/                 # Go 后端
│   ├── cmd/server/          # 主入口
│   ├── internal/
│   │   ├── config/          # 配置
│   │   ├── model/           # 数据模型
│   │   ├── repository/      # 数据访问
│   │   ├── service/         # 业务逻辑
│   │   ├── handler/         # HTTP处理
│   │   ├── middleware/      # 中间件
│   │   └── router/          # 路由
│   ├── pkg/utils/           # 公共工具
│   ├── migrations/          # 数据库迁移
│   └── Dockerfile
│
├── frontend/                # Next.js 商城前台
│   ├── src/
│   │   ├── app/             # 页面
│   │   ├── components/      # 组件
│   │   ├── lib/            # 工具
│   │   └── types/          # 类型
│   └── package.json
│
├── admin/                   # Next.js 管理后台
│   └── ...
│
├── nginx/                   # Nginx 配置
├── docker-compose.yml        # Docker Compose
└── .env.example
```

---

## Task 1: 项目初始化与基础设施搭建

### 1.1 创建后端项目结构

**Files:**
- Create: `backend/cmd/server/main.go`
- Create: `backend/go.mod`
- Create: `backend/internal/config/config.go`
- Create: `backend/internal/config/database.go`
- Create: `backend/internal/router/router.go`

**Steps:**

- [ ] **Step 1: 初始化 Go 模块**

```bash
cd /workspace/cross-border-ecommerce-site
mkdir -p backend/cmd/server backend/internal/{config,model,repository,service,handler,middleware,router} backend/pkg/utils backend/migrations
cd backend
go mod init github.com/C-sanjin/cross-border-ecommerce/backend
```

- [ ] **Step 2: 创建配置管理 (config.go)**

创建 `internal/config/config.go`:

```go
package config

import (
    "github.com/spf13/viper"
)

type Config struct {
    Server   ServerConfig
    Database DatabaseConfig
    Redis    RedisConfig
    JWT      JWTConfig
}

type ServerConfig struct {
    Port string
    Mode string
}

type DatabaseConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
}

type RedisConfig struct {
    Host string
    Port string
}

type JWTConfig struct {
    Secret          string
    AccessExpiry    int
    RefreshExpiry   int
}

func Load() *Config {
    viper.SetConfigName(".env")
    viper.SetConfigType("env")
    viper.AutomaticEnv()

    var cfg Config
    viper.Unmarshal(&cfg)
    return &cfg
}
```

- [ ] **Step 3: 创建主入口 (main.go)**

创建 `cmd/server/main.go`:

```go
package main

import (
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/recover"
    
    "backend/internal/config"
    "backend/internal/router"
)

func main() {
    cfg := config.Load()
    
    app := fiber.New(fiber.Config{
        AppName: "Cross-border E-commerce API",
    })
    
    app.Use(logger.New())
    app.Use(recover.New())
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders: "Origin,Content-Type,Accept,Authorization",
    }))
    
    router.Setup(app, cfg)
    
    log.Fatal(app.Listen(":" + cfg.Server.Port))
}
```

- [ ] **Step 4: 创建路由占位 (router.go)**

创建 `internal/router/router.go`:

```go
package router

import (
    "github.com/gofiber/fiber/v2"
    "backend/internal/config"
)

func Setup(app *fiber.App, cfg *config.Config) {
    app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"status": "ok"})
    })
    
    api := app.Group("/api/v1")
    
    // 路由将在后续任务中实现
}
```

- [ ] **Step 5: 初始化前端项目**

```bash
cd /workspace/cross-border-ecommerce-site
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd frontend
npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers zod
```

- [ ] **Step 6: 初始化管理后台项目**

```bash
cd /workspace/cross-border-ecommerce-site
npx create-next-app@latest admin --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd admin
npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers zod lucide-react
```

- [ ] **Step 7: 创建 Docker Compose 文件**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ecommerce
      MYSQL_USER: ecommerce
      MYSQL_PASSWORD: ecpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=ecommerce
      - DB_PASSWORD=ecpassword
      - DB_NAME=ecommerce
      - REDIS_HOST=redis
      - REDIS_PORT=6379

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  admin:
    build: ./admin
    ports:
      - "3001:3001"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - admin
      - backend

volumes:
  mysql_data:
  redis_data:
```

- [ ] **Step 8: 创建 Nginx 配置**

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }
    
    upstream admin {
        server admin:3001;
    }
    
    upstream backend {
        server backend:8080;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /admin/ {
            rewrite ^/admin/(.*) /$1 break;
            proxy_pass http://admin;
            proxy_set_header Host $host;
        }
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
        }
    }
}
```

- [ ] **Step 9: 创建环境变量示例**

Create `.env.example`:

```env
# Server
SERVER_PORT=8080
SERVER_MODE=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=ecommerce
DB_PASSWORD=ecpassword
DB_NAME=ecommerce

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=15
JWT_REFRESH_EXPIRY=20160

# Frontend URL
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

- [ ] **Step 10: 创建 Git 子模块配置 (可选)**

在 `backend/.gitignore` 和 `frontend/.gitignore` 中添加:

```gitignore
node_modules/
.env
dist/
```

- [ ] **Step 11: 提交 Phase 1 基础设施**

```bash
cd /workspace/cross-border-ecommerce-site
git add .
git commit -m "feat: Phase 1 - 项目初始化与基础设施搭建"
```

---

## Task 2: 数据库设计与迁移

### 2.1 设计数据库模型

**Files:**
- Create: `backend/internal/model/user.go`
- Create: `backend/internal/model/product.go`
- Create: `backend/internal/model/order.go`
- Create: `backend/internal/model/cart.go`
- Create: `backend/internal/model/admin.go`

**Steps:**

- [ ] **Step 1: 创建用户模型 (user.go)**

```go
package model

import (
    "time"
    "github.com/lib/pq"
)

type User struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Email     string    `json:"email" gorm:"uniqueIndex;not null"`
    Password  string    `json:"-" gorm:"not null"`
    Name      string    `json:"name"`
    Phone     string    `json:"phone"`
    Status    string    `json:"status" gorm:"default:active"` // active, banned
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type UserAddress struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    UserID    uint      `json:"user_id" gorm:"not null"`
    Name      string    `json:"name"`
    Phone     string    `json:"phone"`
    Country   string    `json:"country"`
    Province  string    `json:"province"`
    City      string    `json:"city"`
    District  string    `json:"district"`
    Street    string    `json:"street"`
    ZipCode   string    `json:"zip_code"`
    IsDefault bool      `json:"is_default" gorm:"default:false"`
    CreatedAt time.Time `json:"created_at"`
}
```

- [ ] **Step 2: 创建产品模型 (product.go)**

```go
package model

type Product struct {
    ID          uint           `json:"id" gorm:"primaryKey"`
    Title       string         `json:"title" gorm:"not null"`
    Description string         `json:"description" gorm:"type:text"`
    CategoryID  uint           `json:"category_id"`
    Category    ProductCategory `json:"category" gorm:"foreignKey:CategoryID"`
    Price       float64        `json:"price" gorm:"not null"`
    ComparePrice float64       `json:"compare_price"`
    SKU         string         `json:"sku" gorm:"uniqueIndex"`
    Stock       int            `json:"stock" gorm:"default:0"`
    Images      pq.StringArray `json:"images" gorm:"type:text[]"`
    Status      string         `json:"status" gorm:"default:draft"` // draft, active, inactive
    Weight      float64        `json:"weight"` // kg
    CreatedAt   int64         `json:"created_at"`
    UpdatedAt   int64         `json:"updated_at"`
}

type ProductCategory struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Name      string    `json:"name" gorm:"not null"`
    ParentID  *uint     `json:"parent_id"`
    SortOrder int       `json:"sort_order" gorm:"default:0"`
    Status    string    `json:"status" gorm:"default:active"`
    CreatedAt int64     `json:"created_at"`
}
```

- [ ] **Step 3: 创建订单模型 (order.go)**

```go
package model

type Order struct {
    ID            uint         `json:"id" gorm:"primaryKey"`
    OrderNo       string       `json:"order_no" gorm:"uniqueIndex;not null"`
    UserID        uint         `json:"user_id"`
    Status        string       `json:"status" gorm:"default:pending"` // pending, paid, processing, shipped, delivered, cancelled, refunded
    TotalAmount   float64      `json:"total_amount" gorm:"not null"`
    DiscountAmount float64     `json:"discount_amount" gorm:"default:0"`
    ShippingFee   float64      `json:"shipping_fee" gorm:"default:0"`
    PaymentMethod string       `json:"payment_method"`
    ShippingAddress OrderAddress `json:"shipping_address"`
    Note          string       `json:"note"`
    CreatedAt     int64        `json:"created_at"`
    UpdatedAt     int64        `json:"updated_at"`
}

type OrderItem struct {
    ID        uint    `json:"id" gorm:"primaryKey"`
    OrderID   uint    `json:"order_id" gorm:"not null"`
    ProductID uint    `json:"product_id"`
    SKU       string  `json:"sku"`
    Title     string  `json:"title"`
    Price     float64 `json:"price" gorm:"not null"`
    Quantity  int     `json:"quantity" gorm:"not null"`
    Subtotal  float64 `json:"subtotal" gorm:"not null"`
}

type OrderAddress struct {
    Name    string `json:"name"`
    Phone   string `json:"phone"`
    Country string `json:"country"`
    State   string `json:"state"`
    City    string `json:"city"`
    Street  string `json:"street"`
    ZipCode string `json:"zip_code"`
}
```

- [ ] **Step 4: 创建购物车模型 (cart.go)**

```go
package model

type Cart struct {
    ID        uint       `json:"id" gorm:"primaryKey"`
    UserID    uint       `json:"user_id" gorm:"uniqueIndex;not null"`
    Items     []CartItem `json:"items" gorm:"foreignKey:CartID"`
    CreatedAt int64      `json:"created_at"`
    UpdatedAt int64      `json:"updated_at"`
}

type CartItem struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    CartID    uint      `json:"cart_id" gorm:"not null"`
    ProductID uint      `json:"product_id" gorm:"not null"`
    Product   Product   `json:"product" gorm:"foreignKey:ProductID"`
    Quantity  int       `json:"quantity" gorm:"not null;default:1"`
    CreatedAt int64     `json:"created_at"`
}
```

- [ ] **Step 5: 创建管理员模型 (admin.go)**

```go
package model

type AdminUser struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Username  string    `json:"username" gorm:"uniqueIndex;not null"`
    Email     string    `json:"email" gorm:"uniqueIndex;not null"`
    Password  string    `json:"-" gorm:"not null"`
    Name      string    `json:"name"`
    Role      string    `json:"role" gorm:"default:operator"` // super_admin, product_admin, customer_service, finance
    Status    string    `json:"status" gorm:"default:active"`
    LastLogin int64     `json:"last_login"`
    CreatedAt int64     `json:"created_at"`
    UpdatedAt int64     `json:"updated_at"`
}
```

- [ ] **Step 6: 创建数据库迁移**

Create `backend/migrations/001_init.sql`:

```sql
-- 创建数据库 (在 MySQL 中执行)
CREATE DATABASE IF NOT EXISTS ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at BIGINT,
    updated_at BIGINT,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户地址表
CREATE TABLE IF NOT EXISTS user_addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    province VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    street VARCHAR(255),
    zip_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 产品分类表
CREATE TABLE IF NOT EXISTS product_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT UNSIGNED,
    sort_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at BIGINT,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 产品表
CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT UNSIGNED,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    sku VARCHAR(100) UNIQUE,
    stock INT DEFAULT 0,
    images JSON,
    status VARCHAR(20) DEFAULT 'draft',
    weight DECIMAL(10,2),
    created_at BIGINT,
    updated_at BIGINT,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_sku (sku),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 购物车表
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at BIGINT,
    updated_at BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 购物车项表
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at BIGINT,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    shipping_address JSON,
    note TEXT,
    created_at BIGINT,
    updated_at BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单项表
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED,
    sku VARCHAR(100),
    title VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 管理员表
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'operator',
    status VARCHAR(20) DEFAULT 'active',
    last_login BIGINT,
    created_at BIGINT,
    updated_at BIGINT,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

- [ ] **Step 7: 提交数据库设计**

```bash
cd /workspace/cross-border-ecommerce-site
git add .
git commit -m "feat: Phase 1 - 数据库设计与迁移"
```

---

## Task 3: 用户认证与授权

### 3.1 后端认证实现

**Files:**
- Create: `backend/internal/repository/user_repo.go`
- Create: `backend/internal/service/auth_service.go`
- Create: `backend/internal/handler/auth_handler.go`
- Create: `backend/internal/middleware/auth_middleware.go`
- Modify: `backend/internal/router/router.go`

**Steps:**

- [ ] **Step 1: 创建用户仓库层 (user_repo.go)**

```go
package repository

import (
    "backend/internal/model"
    "gorm.io/gorm"
)

type UserRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User) error {
    return r.db.Create(user).Error
}

func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
    var user model.User
    err := r.db.Where("email = ?", email).First(&user).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) FindByID(id uint) (*model.User, error) {
    var user model.User
    err := r.db.First(&user, id).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) Update(user *model.User) error {
    return r.db.Save(user).Error
}
```

- [ ] **Step 2: 创建认证服务层 (auth_service.go)**

```go
package service

import (
    "errors"
    "time"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    
    "backend/internal/config"
    "backend/internal/model"
    "backend/internal/repository"
)

type AuthService struct {
    userRepo *repository.UserRepository
    cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
    return &AuthService{userRepo: userRepo, cfg: cfg}
}

type RegisterRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=6"`
    Name     string `json:"name"`
}

type LoginRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
    User         *model.User `json:"user"`
    AccessToken  string      `json:"access_token"`
    RefreshToken string      `json:"refresh_token"`
}

func (s *AuthService) Register(req *RegisterRequest) (*AuthResponse, error) {
    existing, _ := s.userRepo.FindByEmail(req.Email)
    if existing != nil {
        return nil, errors.New("email already exists")
    }
    
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return nil, err
    }
    
    user := &model.User{
        Email:    req.Email,
        Password: string(hashedPassword),
        Name:     req.Name,
        Status:   "active",
    }
    
    if err := s.userRepo.Create(user); err != nil {
        return nil, err
    }
    
    return s.generateToken(user)
}

func (s *AuthService) Login(req *LoginRequest) (*AuthResponse, error) {
    user, err := s.userRepo.FindByEmail(req.Email)
    if err != nil {
        return nil, errors.New("invalid credentials")
    }
    
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
        return nil, errors.New("invalid credentials")
    }
    
    return s.generateToken(user)
}

func (s *AuthService) generateToken(user *model.User) (*AuthResponse, error) {
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "email":   user.Email,
        "exp":     time.Now().Add(time.Minute * time.Duration(s.cfg.JWT.AccessExpiry)).Unix(),
    })
    
    accessTokenString, err := accessToken.SignedString([]byte(s.cfg.JWT.Secret))
    if err != nil {
        return nil, err
    }
    
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "type":    "refresh",
        "exp":     time.Now().Add(time.Minute * time.Duration(s.cfg.JWT.RefreshExpiry)).Unix(),
    })
    
    refreshTokenString, err := refreshToken.SignedString([]byte(s.cfg.JWT.Secret))
    if err != nil {
        return nil, err
    }
    
    return &AuthResponse{
        User:         user,
        AccessToken:  accessTokenString,
        RefreshToken: refreshTokenString,
    }, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return []byte(s.cfg.JWT.Secret), nil
    })
    
    if err != nil {
        return nil, err
    }
    
    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        return &claims, nil
    }
    
    return nil, errors.New("invalid token")
}
```

- [ ] **Step 3: 创建认证处理器 (auth_handler.go)**

```go
package handler

import (
    "github.com/gofiber/fiber/v2"
    "backend/internal/service"
)

type AuthHandler struct {
    authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
    return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
    var req service.RegisterRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
    }
    
    if req.Email == "" || req.Password == "" {
        return c.Status(400).JSON(fiber.Map{"error": "email and password are required"})
    }
    
    response, err := h.authService.Register(&req)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.Status(201).JSON(response)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
    var req service.LoginRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
    }
    
    response, err := h.authService.Login(&req)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(response)
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
    type RefreshRequest struct {
        RefreshToken string `json:"refresh_token"`
    }
    
    var req RefreshRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
    }
    
    claims, err := h.authService.ValidateToken(req.RefreshToken)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "invalid refresh token"})
    }
    
    userID := uint((*claims)["user_id"].(float64))
    user, err := h.authService.GetUserByID(userID)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "user not found"})
    }
    
    response, _ := h.authService.generateToken(user)
    return c.JSON(response)
}

func (h *AuthHandler) GetUserByID(id uint) (*model.User, error) {
    return h.authService.GetUserByID(id)
}
```

- [ ] **Step 4: 创建认证中间件 (auth_middleware.go)**

```go
package middleware

import (
    "strings"
    "github.com/gofiber/fiber/v2"
    "backend/internal/service"
)

func AuthMiddleware(authService *service.AuthService) fiber.Handler {
    return func(c *fiber.Ctx) error {
        authHeader := c.Get("Authorization")
        if authHeader == "" {
            return c.Status(401).JSON(fiber.Map{"error": "missing authorization header"})
        }
        
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            return c.Status(401).JSON(fiber.Map{"error": "invalid authorization format"})
        }
        
        claims, err := authService.ValidateToken(parts[1])
        if err != nil {
            return c.Status(401).JSON(fiber.Map{"error": "invalid token"})
        }
        
        c.Locals("user_id", uint((*claims)["user_id"].(float64)))
        c.Locals("email", (*claims)["email"].(string))
        
        return c.Next()
    }
}

func OptionalAuthMiddleware(authService *service.AuthService) fiber.Handler {
    return func(c *fiber.Ctx) error {
        authHeader := c.Get("Authorization")
        if authHeader == "" {
            return c.Next()
        }
        
        parts := strings.Split(authHeader, " ")
        if len(parts) == 2 && parts[0] == "Bearer" {
            claims, err := authService.ValidateToken(parts[1])
            if err == nil {
                c.Locals("user_id", uint((*claims)["user_id"].(float64)))
                c.Locals("email", (*claims)["email"].(string))
            }
        }
        
        return c.Next()
    }
}
```

- [ ] **Step 5: 更新路由配置**

Update `internal/router/router.go`:

```go
package router

import (
    "github.com/gofiber/fiber/v2"
    "backend/internal/config"
    "backend/internal/handler"
    "backend/internal/middleware"
    "backend/internal/service"
    "backend/internal/repository"
    "gorm.io/gorm"
)

func Setup(app *fiber.App, db *gorm.DB, cfg *config.Config) {
    userRepo := repository.NewUserRepository(db)
    authService := service.NewAuthService(userRepo, cfg)
    authHandler := handler.NewAuthHandler(authService)
    
    app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"status": "ok"})
    })
    
    api := app.Group("/api/v1")
    
    auth := api.Group("/auth")
    auth.Post("/register", authHandler.Register)
    auth.Post("/login", authHandler.Login)
    auth.Post("/refresh", authHandler.RefreshToken)
    
    // 需要认证的路由示例
    protected := api.Group("/", middleware.AuthMiddleware(authService))
    protected.Get("/profile", func(c *fiber.Ctx) error {
        userID := c.Locals("user_id").(uint)
        return c.JSON(fiber.Map{"user_id": userID})
    })
}
```

- [ ] **Step 6: 提交认证功能**

```bash
cd /workspace/cross-border-ecommerce-site
git add .
git commit -m "feat: Phase 1 - 用户认证与授权"
```

---

## Task 4: 产品浏览与搜索

### 4.1 产品 API 实现

**Files:**
- Create: `backend/internal/repository/product_repo.go`
- Create: `backend/internal/service/product_service.go`
- Create: `backend/internal/handler/product_handler.go`
- Modify: `backend/internal/router/router.go`

**Steps:**

- [ ] **Step 1: 创建产品仓库层 (product_repo.go)**

```go
package repository

import (
    "backend/internal/model"
    "gorm.io/gorm"
    "gorm.io/plugin/dbresolver"
)

type ProductRepository struct {
    db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
    return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(product *model.Product) error {
    return r.db.Create(product).Error
}

func (r *ProductRepository) FindAll(page, pageSize int, categoryID *uint, status string) ([]model.Product, int64, error) {
    var products []model.Product
    var total int64
    
    query := r.db.Model(&model.Product{}).Where("status = ?", status)
    
    if categoryID != nil {
        query = query.Where("category_id = ?", *categoryID)
    }
    
    query.Count(&total)
    
    offset := (page - 1) * pageSize
    err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&products).Error
    
    return products, total, err
}

func (r *ProductRepository) FindByID(id uint) (*model.Product, error) {
    var product model.Product
    err := r.db.Preload("Category").First(&product, id).Error
    if err != nil {
        return nil, err
    }
    return &product, nil
}

func (r *ProductRepository) FindBySKU(sku string) (*model.Product, error) {
    var product model.Product
    err := r.db.Where("sku = ?", sku).First(&product).Error
    if err != nil {
        return nil, err
    }
    return &product, nil
}

func (r *ProductRepository) Search(keyword string, page, pageSize int) ([]model.Product, int64, error) {
    var products []model.Product
    var total int64
    
    query := r.db.Model(&model.Product{}).
        Where("status = ? AND (title LIKE ? OR description LIKE ?)", "active", "%"+keyword+"%", "%"+keyword+"%")
    
    query.Count(&total)
    
    offset := (page - 1) * pageSize
    err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&products).Error
    
    return products, total, err
}

func (r *ProductRepository) Update(product *model.Product) error {
    return r.db.Save(product).Error
}

func (r *ProductRepository) Delete(id uint) error {
    return r.db.Delete(&model.Product{}, id).Error
}

func (r *ProductRepository) FindCategories() ([]model.ProductCategory, error) {
    var categories []model.ProductCategory
    err := r.db.Where("status = ?", "active").Order("sort_order ASC").Find(&categories).Error
    return categories, err
}

func (r *ProductRepository) CreateCategory(category *model.ProductCategory) error {
    return r.db.Create(category).Error
}
```

- [ ] **Step 2: 创建产品服务层 (product_service.go)**

```go
package service

import (
    "backend/internal/model"
    "backend/internal/repository"
)

type ProductService struct {
    productRepo *repository.ProductRepository
}

func NewProductService(productRepo *repository.ProductRepository) *ProductService {
    return &ProductService{productRepo: productRepo}
}

type ProductListRequest struct {
    Page       int    `query:"page"`
    PageSize   int    `query:"page_size"`
    CategoryID *uint  `query:"category_id"`
    Keyword    string `query:"keyword"`
}

type ProductListResponse struct {
    Products   []model.Product `json:"products"`
    Total      int64           `json:"total"`
    Page       int             `json:"page"`
    PageSize   int             `json:"page_size"`
    TotalPages int             `json:"total_pages"`
}

func (s *ProductService) ListProducts(req *ProductListRequest) (*ProductListResponse, error) {
    if req.Page < 1 {
        req.Page = 1
    }
    if req.PageSize < 1 || req.PageSize > 100 {
        req.PageSize = 20
    }
    
    var products []model.Product
    var total int64
    var err error
    
    if req.Keyword != "" {
        products, total, err = s.productRepo.Search(req.Keyword, req.Page, req.PageSize)
    } else {
        products, total, err = s.productRepo.FindAll(req.Page, req.PageSize, req.CategoryID, "active")
    }
    
    if err != nil {
        return nil, err
    }
    
    totalPages := int(total) / req.PageSize
    if int(total)%req.PageSize > 0 {
        totalPages++
    }
    
    return &ProductListResponse{
        Products:   products,
        Total:      total,
        Page:       req.Page,
        PageSize:   req.PageSize,
        TotalPages: totalPages,
    }, nil
}

func (s *ProductService) GetProduct(id uint) (*model.Product, error) {
    return s.productRepo.FindByID(id)
}

func (s *ProductService) GetCategories() ([]model.ProductCategory, error) {
    return s.productRepo.FindCategories()
}
```

- [ ] **Step 3: 创建产品处理器 (product_handler.go)**

```go
package handler

import (
    "strconv"
    "github.com/gofiber/fiber/v2"
    "backend/internal/service"
)

type ProductHandler struct {
    productService *service.ProductService
}

func NewProductHandler(productService *service.ProductService) *ProductHandler {
    return &ProductHandler{productService: productService}
}

func (h *ProductHandler) ListProducts(c *fiber.Ctx) error {
    req := &service.ProductListRequest{
        Page:     1,
        PageSize: 20,
    }
    
    if page := c.Query("page"); page != "" {
        if p, err := strconv.Atoi(page); err == nil {
            req.Page = p
        }
    }
    
    if pageSize := c.Query("page_size"); pageSize != "" {
        if ps, err := strconv.Atoi(pageSize); err == nil {
            req.PageSize = ps
        }
    }
    
    req.Keyword = c.Query("keyword")
    
    response, err := h.productService.ListProducts(req)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(response)
}

func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
    id, err := strconv.ParseUint(c.Params("id"), 10, 32)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid product id"})
    }
    
    product, err := h.productService.GetProduct(uint(id))
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "product not found"})
    }
    
    return c.JSON(product)
}

func (h *ProductHandler) GetCategories(c *fiber.Ctx) error {
    categories, err := h.productService.GetCategories()
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"categories": categories})
}
```

- [ ] **Step 4: 更新路由配置**

Update `internal/router/router.go`:

```go
func Setup(app *fiber.App, db *gorm.DB, cfg *config.Config) {
    // ... 现有代码 ...
    
    productRepo := repository.NewProductRepository(db)
    productService := service.NewProductService(productRepo)
    productHandler := handler.NewProductHandler(productService)
    
    // 产品公开接口
    api.Get("/products", productHandler.ListProducts)
    api.Get("/products/:id", productHandler.GetProduct)
    api.Get("/categories", productHandler.GetCategories)
}
```

- [ ] **Step 5: 提交产品功能**

```bash
git add .
git commit -m "feat: Phase 1 - 产品浏览与搜索"
```

---

## Task 5: 购物车系统

### 5.1 购物车 API 实现

**Files:**
- Create: `backend/internal/repository/cart_repo.go`
- Create: `backend/internal/service/cart_service.go`
- Create: `backend/internal/handler/cart_handler.go`
- Modify: `backend/internal/router/router.go`

**Steps:**

- [ ] **Step 1: 创建购物车仓库层 (cart_repo.go)**

```go
package repository

import (
    "backend/internal/model"
    "gorm.io/gorm"
)

type CartRepository struct {
    db *gorm.DB
}

func NewCartRepository(db *gorm.DB) *CartRepository {
    return &CartRepository{db: db}
}

func (r *CartRepository) GetOrCreateCart(userID uint) (*model.Cart, error) {
    var cart model.Cart
    err := r.db.Where("user_id = ?", userID).First(&cart).Error
    
    if err == gorm.ErrRecordNotFound {
        cart = model.Cart{UserID: userID}
        if err := r.db.Create(&cart).Error; err != nil {
            return nil, err
        }
    } else if err != nil {
        return nil, err
    }
    
    return &cart, nil
}

func (r *CartRepository) GetCartWithItems(userID uint) (*model.Cart, error) {
    var cart model.Cart
    err := r.db.Preload("Items.Product").Where("user_id = ?", userID).First(&cart).Error
    if err != nil {
        return nil, err
    }
    return &cart, nil
}

func (r *CartRepository) AddItem(cartID, productID uint, quantity int) (*model.CartItem, error) {
    var existingItem model.CartItem
    err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&existingItem).Error
    
    if err == nil {
        existingItem.Quantity += quantity
        if err := r.db.Save(&existingItem).Error; err != nil {
            return nil, err
        }
        return &existingItem, nil
    }
    
    if err == gorm.ErrRecordNotFound {
        item := &model.CartItem{
            CartID:    cartID,
            ProductID: productID,
            Quantity:  quantity,
        }
        if err := r.db.Create(item).Error; err != nil {
            return nil, err
        }
        return item, nil
    }
    
    return nil, err
}

func (r *CartRepository) UpdateItem(itemID uint, quantity int) error {
    return r.db.Model(&model.CartItem{}).Where("id = ?", itemID).Update("quantity", quantity).Error
}

func (r *CartRepository) RemoveItem(itemID uint) error {
    return r.db.Delete(&model.CartItem{}, itemID).Error
}

func (r *CartRepository) ClearCart(cartID uint) error {
    return r.db.Where("cart_id = ?", cartID).Delete(&model.CartItem{}).Error
}
```

- [ ] **Step 2: 创建购物车服务层 (cart_service.go)**

```go
package service

import (
    "errors"
    "backend/internal/model"
    "backend/internal/repository"
)

type CartService struct {
    cartRepo    *CartRepository
    productRepo *ProductRepository
}

func NewCartService(cartRepo *CartRepository, productRepo *ProductRepository) *CartService {
    return &CartService{cartRepo: cartRepo, productRepo: productRepo}
}

type AddToCartRequest struct {
    ProductID uint `json:"product_id" validate:"required"`
    Quantity  int  `json:"quantity" validate:"required,min=1"`
}

type UpdateCartItemRequest struct {
    Quantity int `json:"quantity" validate:"required,min=1"`
}

func (s *CartService) GetCart(userID uint) (*model.Cart, error) {
    return s.cartRepo.GetCartWithItems(userID)
}

func (s *CartService) AddToCart(userID uint, req *AddToCartRequest) (*model.Cart, error) {
    product, err := s.productRepo.FindByID(req.ProductID)
    if err != nil {
        return nil, errors.New("product not found")
    }
    
    if product.Stock < req.Quantity {
        return nil, errors.New("insufficient stock")
    }
    
    cart, err := s.cartRepo.GetOrCreateCart(userID)
    if err != nil {
        return nil, err
    }
    
    _, err = s.cartRepo.AddItem(cart.ID, req.ProductID, req.Quantity)
    if err != nil {
        return nil, err
    }
    
    return s.cartRepo.GetCartWithItems(userID)
}

func (s *CartService) UpdateCartItem(userID uint, itemID uint, req *UpdateCartItemRequest) error {
    cart, err := s.cartRepo.GetCart(userID)
    if err != nil {
        return errors.New("cart not found")
    }
    
    for _, item := range cart.Items {
        if item.ID == itemID {
            if product, _ := s.productRepo.FindByID(item.ProductID); product != nil {
                if product.Stock < req.Quantity {
                    return errors.New("insufficient stock")
                }
            }
            return s.cartRepo.UpdateItem(itemID, req.Quantity)
        }
    }
    
    return errors.New("item not found in cart")
}

func (s *CartService) RemoveFromCart(userID uint, itemID uint) error {
    cart, err := s.cartRepo.GetCart(userID)
    if err != nil {
        return errors.New("cart not found")
    }
    
    for _, item := range cart.Items {
        if item.ID == itemID {
            return s.cartRepo.RemoveItem(itemID)
        }
    }
    
    return errors.New("item not found in cart")
}

func (s *CartService) ClearCart(userID uint) error {
    cart, err := s.cartRepo.GetOrCreateCart(userID)
    if err != nil {
        return err
    }
    return s.cartRepo.ClearCart(cart.ID)
}
```

- [ ] **Step 3: 创建购物车处理器 (cart_handler.go)**

```go
package handler

import (
    "strconv"
    "github.com/gofiber/fiber/v2"
    "backend/internal/service"
)

type CartHandler struct {
    cartService *CartService
}

func NewCartHandler(cartService *CartService) *CartHandler {
    return &CartHandler{cartService: cartService}
}

func (h *CartHandler) GetCart(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)
    
    cart, err := h.cartService.GetCart(userID)
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "cart not found"})
    }
    
    return c.JSON(cart)
}

func (h *CartHandler) AddToCart(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)
    
    var req service.AddToCartRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
    }
    
    cart, err := h.cartService.AddToCart(userID, &req)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(cart)
}

func (h *CartHandler) UpdateCartItem(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)
    itemID, err := strconv.ParseUint(c.Params("item_id"), 10, 32)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid item id"})
    }
    
    var req service.UpdateCartItemRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
    }
    
    if err := h.cartService.UpdateCartItem(userID, uint(itemID), &req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"message": "item updated"})
}

func (h *CartHandler) RemoveFromCart(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)
    itemID, err := strconv.ParseUint(c.Params("item_id"), 10, 32)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid item id"})
    }
    
    if err := h.cartService.RemoveFromCart(userID, uint(itemID)); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"message": "item removed"})
}

func (h *CartHandler) ClearCart(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)
    
    if err := h.cartService.ClearCart(userID); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"message": "cart cleared"})
}
```

- [ ] **Step 4: 更新路由配置**

Update `internal/router/router.go`:

```go
func Setup(app *fiber.App, db *gorm.DB, cfg *config.Config) {
    // ... 现有代码 ...
    
    cartRepo := repository.NewCartRepository(db)
    cartService := service.NewCartService(cartRepo, productRepo)
    cartHandler := handler.NewCartHandler(cartService)
    
    // 购物车路由 (需要认证)
    cart := protected.Group("/cart")
    cart.Get("/", cartHandler.GetCart)
    cart.Post("/items", cartHandler.AddToCart)
    cart.Put("/items/:item_id", cartHandler.UpdateCartItem)
    cart.Delete("/items/:item_id", cartHandler.RemoveFromCart)
    cart.Delete("/", cartHandler.ClearCart)
}
```

- [ ] **Step 5: 提交购物车功能**

```bash
git add .
git commit -m "feat: Phase 1 - 购物车系统"
```

---

## Phase 1 完成总结

完成以上 5 个 Task 后，将实现：

| 功能模块 | 状态 |
|----------|------|
| ✅ 项目基础设施 | 已完成 |
| ✅ 数据库设计与迁移 | 已完成 |
| ✅ 用户认证与授权 | 已完成 |
| ✅ 产品浏览与搜索 | 已完成 |
| ✅ 购物车系统 | 已完成 |

---

# Phase 2: 交易闭环

## Task 6: 订单系统

**预计新增文件：**
- `backend/internal/repository/order_repo.go`
- `backend/internal/service/order_service.go`
- `backend/internal/handler/order_handler.go`
- `frontend/src/app/(shop)/checkout/page.tsx`

**核心功能：**
- 创建订单
- 订单列表与详情
- 订单状态流转
- 订单取消与退款申请

---

## Task 7: 支付接口预留

**预计新增文件：**
- `backend/internal/service/payment_service.go`
- `backend/internal/handler/payment_handler.go`
- `backend/pkg/payment/adapter.go`
- `backend/pkg/payment/paypal.go`
- `backend/pkg/payment/stripe.go`

**核心功能：**
- 支付订单创建
- 支付回调处理
- 支付状态更新
- 退款处理

---

# Phase 3: 管理后台

## Task 8: 后台产品管理

**预计新增文件：**
- `admin/src/app/(dashboard)/products/page.tsx`
- `admin/src/app/(dashboard)/products/new/page.tsx`
- `admin/src/components/products-table.tsx`
- `backend/internal/handler/admin/product_handler.go`
- `backend/internal/service/admin/product_admin_service.go`

**核心功能：**
- 产品 CRUD
- 分类管理
- 库存管理
- 批量操作

---

## Task 9: 后台订单管理

**预计新增文件：**
- `admin/src/app/(dashboard)/orders/page.tsx`
- `admin/src/components/orders-table.tsx`
- `backend/internal/handler/admin/order_handler.go`

**核心功能：**
- 订单列表与筛选
- 订单详情查看
- 订单状态更新
- 退款处理

---

## Task 10: 后台用户管理

**预计新增文件：**
- `admin/src/app/(dashboard)/users/page.tsx`
- `admin/src/components/users-table.tsx`
- `backend/internal/handler/admin/user_handler.go`

**核心功能：**
- 用户列表
- 用户详情
- 用户状态管理

---

## Task 11: 数据概览

**预计新增文件：**
- `admin/src/app/(dashboard)/dashboard/page.tsx`
- `backend/internal/handler/admin/dashboard_handler.go`
- `backend/internal/service/admin/dashboard_service.go`

**核心功能：**
- 销售报表
- 用户统计
- 商品分析
- 订单趋势

---

# Phase 4: 增值功能

## Task 12: 多语言多货币

**预计新增文件：**
- `frontend/src/lib/i18n/config.ts`
- `frontend/src/lib/i18n/locales/*.json`
- `frontend/src/components/currency-selector.tsx`
- `backend/internal/service/currency_service.go`

**核心功能：**
- i18n 配置
- 语言切换
- 货币转换
- 地区适配

---

## Task 13: 营销功能

**预计新增文件：**
- `backend/internal/model/coupon.go`
- `backend/internal/handler/promo_handler.go`
- `frontend/src/components/coupon-input.tsx`

**核心功能：**
- 优惠券系统
- 促销活动
- 积分系统

---

## Task 14-15: 性能优化与安全加固

**预计优化：**
- Redis 缓存集成
- 数据库索引优化
- API 限流完善
- 安全头配置

---

# 执行计划总结

| Phase | Task | 描述 | 优先级 |
|-------|------|------|--------|
| 1 | 1 | 项目初始化与基础设施 | P0 |
| 1 | 2 | 数据库设计与迁移 | P0 |
| 1 | 3 | 用户认证与授权 | P0 |
| 1 | 4 | 产品浏览与搜索 | P0 |
| 1 | 5 | 购物车系统 | P0 |
| 2 | 6 | 订单系统 | P0 |
| 2 | 7 | 支付接口预留 | P1 |
| 3 | 8 | 后台产品管理 | P1 |
| 3 | 9 | 后台订单管理 | P1 |
| 3 | 10 | 后台用户管理 | P1 |
| 3 | 11 | 数据概览 | P2 |
| 4 | 12 | 多语言多货币 | P2 |
| 4 | 13 | 营销功能 | P2 |
| 4 | 14-15 | 性能优化与安全加固 | P3 |

---

**下一步行动：**

选择执行方式：

1. **Subagent 驱动 (推荐)** - 每个 Task 由独立的子 Agent 执行，快速迭代
2. **会话内执行** - 在当前会话中逐步执行，定期检查点回顾

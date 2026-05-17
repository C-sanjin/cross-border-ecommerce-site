# Cross-border E-commerce Site

跨境电商独立站项目

## 项目简介

这是一个完整的跨境电商独立站项目，采用前后端分离架构，包含商城前台、运营管理后台和统一后端API服务。项目实现了产品浏览、购物车、订单管理、用户认证等核心电商功能。

## 功能特性

### 商城前台
- ✅ 首页（Hero展示、产品推荐、分类入口）
- ✅ 产品列表（搜索、分类筛选、分页）
- ✅ 产品详情（产品信息、SKU选择、加购、产品评价、相关推荐）
- ✅ 购物车（商品管理、数量调整、清空购物车）
- ✅ 结算（地址填写、支付选择、下单）
- ✅ 用户认证（登录、注册）
- ✅ 用户中心（个人资料、订单列表、订单详情）
- ✅ 分类浏览页

### 运营管理后台
- ✅ 数据概览（营收统计、订单数、用户数、热销商品、库存预警）
- ✅ 产品管理（产品CRUD、分类管理、库存管理）
- ✅ 订单管理（订单列表、状态更新、退款处理）
- ✅ 用户管理（用户列表、状态管理）

### 后端API
- ✅ 用户认证（JWT Token机制、注册/登录/刷新）
- ✅ 产品接口（列表/详情/搜索/分类）
- ✅ 购物车接口（加购/更新/删除/清空）
- ✅ 订单接口（创建订单/订单列表/订单详情/取消订单）
- ✅ 支付接口（PayPal/Stripe支付预留）
- ✅ 管理后台接口（产品/订单/用户/仪表盘）

## 技术栈

### 前端 (Next.js)
- **框架**: Next.js 14.x (App Router)
- **语言**: TypeScript 5.x
- **样式**: Tailwind CSS 3.x
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **UI组件**: 自定义组件 + Tailwind CSS

### 后端 (Go)
- **Web框架**: Fiber v2.x
- **ORM**: GORM v2.x
- **数据库**: MySQL 8.0
- **认证**: JWT (Access Token + Refresh Token)
- **配置管理**: Viper

### 项目结构
```
cross-border-ecommerce-site/
├── frontend/                    # 商城前台 Next.js
│   ├── src/
│   │   ├── app/                # App Router 页面
│   │   │   ├── account/        # 用户中心（登录/注册/订单/个人资料）
│   │   │   ├── products/       # 产品页面（列表/详情）
│   │   │   ├── cart/           # 购物车
│   │   │   ├── checkout/       # 结账/支付成功
│   │   │   ├── categories/     # 分类浏览
│   │   │   └── page.tsx        # 首页
│   │   ├── components/
│   │   │   └── ui/             # UI组件
│   │   ├── lib/
│   │   │   └── api.ts          # API客户端
│   │   ├── store/
│   │   │   ├── authStore.ts    # 认证状态
│   │   │   └── cartStore.ts    # 购物车状态
│   │   └── types/
│   │       └── index.ts        # TypeScript类型定义
│   └── package.json
│
├── admin/                       # 运营管理后台 Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/    # 仪表盘/产品/订单/用户
│   │   │   └── login/          # 管理后台登录
│   │   ├── components/
│   │   │   └── Sidebar.tsx     # 侧边栏
│   │   └── lib/
│   │       └── api.ts          # 管理后台API客户端
│   └── package.json
│
├── backend/                     # Go 后端服务
│   ├── cmd/
│   │   └── server/
│   │       └── main.go         # 主入口
│   ├── internal/
│   │   ├── config/             # 配置管理
│   │   ├── handler/            # HTTP处理器
│   │   │   ├── admin/          # 管理后台接口
│   │   │   ├── auth_handler.go
│   │   │   ├── product_handler.go
│   │   │   ├── cart_handler.go
│   │   │   ├── order_handler.go
│   │   │   └── payment_handler.go
│   │   ├── service/            # 业务逻辑层
│   │   ├── repository/         # 数据访问层
│   │   ├── model/              # 数据模型
│   │   ├── middleware/         # 中间件
│   │   └── router/             # 路由配置
│   ├── migrations/
│   │   └── 001_init_schema.sql # 数据库迁移
│   ├── go.mod
│   └── go.sum
│
├── docs/                        # 文档
│   ├── specs/                  # 设计文档
│   └── plans/                  # 实施计划
│
├── .env.example                # 环境变量示例
├── docker-compose.yml          # Docker编排
└── README.md
```

## 快速开始

### 前置条件
- Node.js 18+
- Go 1.22+
- MySQL 8.0+

### 后端启动
```bash
cd backend

# 复制并配置环境变量
cp ../.env.example .env
# 修改 .env 中的数据库配置

# 安装依赖
go mod download

# 启动服务
go run cmd/server/main.go
```
后端服务将在 `http://localhost:8080` 启动

### 前端启动
```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量（可选）
cp .env.example .env.local

# 启动开发服务器
npm run dev
```
前端服务将在 `http://localhost:3000` 启动

### 管理后台启动
```bash
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```
管理后台将在 `http://localhost:3001` 启动

### Docker 启动
```bash
docker-compose up -d
```

## 开发指南

### 数据库迁移
数据库初始化脚本位于 `backend/migrations/001_init_schema.sql`

### API 文档
后端API遵循 RESTful 风格，主要接口：
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/products` - 产品列表
- `GET /api/v1/products/:id` - 产品详情
- `GET /api/v1/cart` - 获取购物车
- `POST /api/v1/cart/items` - 加购
- `POST /api/v1/orders` - 创建订单
- `GET /api/v1/orders` - 订单列表

### 管理后台API
- `GET /api/v1/admin/dashboard` - 仪表盘数据
- `GET /api/v1/admin/products` - 产品列表
- `POST /api/v1/admin/products` - 创建产品
- `PUT /api/v1/admin/products/:id` - 更新产品
- `DELETE /api/v1/admin/products/:id` - 删除产品
- `GET /api/v1/admin/orders` - 订单列表
- `PATCH /api/v1/admin/orders/:id/status` - 更新订单状态

## 部署说明

### 环境变量配置
复制 `.env.example` 为 `.env`，修改以下配置：
- `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME` - 数据库配置
- `JWT_SECRET` - JWT密钥（生产环境必须修改）
- `SERVER_PORT` - 后端服务端口

### 前端部署
```bash
cd frontend
npm run build
# 使用 nginx 或其他 Web 服务器部署 .next 或 out 目录
```

### 后端部署
```bash
cd backend
go build -o server cmd/server/main.go
./server
```

## 许可证

MIT License

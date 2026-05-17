# 跨境电商独立站 - 系统架构设计文档

**日期**: 2026-05-04  
**版本**: 1.1  
**状态**: 已完善安全、简约设计、性能设计

---

## 1. 项目概述

### 1.1 项目背景
这是一个面向多市场的跨境电商独立站项目，采用前后端分离架构，包含商城前台、运营管理后台两个应用，以及统一的后端API服务。

### 1.2 核心需求
- ✅ 多市场覆盖的跨境电商独立站
- ✅ 吸睛美观的设计风格
- ✅ 灵活的多品类切换支持
- ✅ 完整的运营管理后台（产品、用户、订单）
- ✅ 高安全性、稳定性的后端服务
- ✅ 防恶意攻击、支付安全保护
- ✅ 易维护、易用性优先

---

## 2. 系统架构总览

### 2.1 架构图
```
┌─────────────────────────────────────────────────────────┐
│                    用户浏览器                            │
└──────────────┬───────────────────────────────┬───────────┘
               │                               │
        ┌──────▼─────────┐          ┌──────────▼────────┐
        │  商城前台      │          │  运营管理后台     │
        │ (Next.js)     │          │  (Next.js/React) │
        └──────┬─────────┘          └──────────┬────────┘
               │                               │
               └───────────────────┬───────────┘
                                   │
                          ┌────────▼────────┐
                          │  Go + Fiber     │
                          │  后端 API       │
                          │  Port: 8080     │
                          └────────┬────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
        ┌───────────┐    ┌─────────────┐    ┌────────────┐
        │  MySQL    │    │    Redis    │    │  第三方服务  │
        │  8.0      │    │   Cache     │    │ (支付/物流) │
        └───────────┘    └─────────────┘    └────────────┘

                 ┌──────────────────────────────┐
                 │     Nginx 反向代理           │
                 │     (解决跨域问题)           │
                 └──────────────────────────────┘
```

---

## 3. 技术栈详情

### 3.1 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.x | React 全栈框架，App Router，SSR |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式框架，响应式设计 |
| React Query | 5.x | 服务端状态管理，数据缓存 |
| React Hook Form | 7.x | 表单处理 |
| Shadcn/ui | - | 组件库 (可选) |

### 3.2 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Go | 1.22+ | 后端服务 |
| Fiber | 2.x | Web 框架 |
| GORM | 2.x | ORM 框架 |
| MySQL | 8.0 | 关系型数据库 |
| Redis | 7.x | 缓存、会话管理 |
| JWT | - | 认证授权 |
| Viper | - | 配置管理 |
| Zap | - | 结构化日志 |

### 3.3 部署架构

| 技术 | 用途 |
|------|------|
| Docker | 容器化 |
| Docker Compose | 多容器编排 |
| Nginx | 反向代理、负载均衡 |

---

## 4. 目录结构设计

```
cross-border-ecommerce-site/
├── frontend/                    # 商城前台 Next.js
│   ├── src/
│   │   ├── app/                # App Router
│   │   │   ├── [lang]/         # 多语言路由
│   │   │   ├── products/       # 产品页面
│   │   │   ├── cart/           # 购物车
│   │   │   ├── checkout/       # 结账
│   │   │   ├── account/        # 用户中心
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── ui/             # 通用UI组件
│   │   │   ├── product/        # 产品相关组件
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api/            # API 客户端
│   │   │   ├── i18n/           # 多语言配置
│   │   │   └── utils/          # 工具函数
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── stores/             # 状态管理 (Zustand)
│   │   └── types/              # TypeScript 类型
│   ├── public/                 # 静态资源
│   └── package.json
│
├── admin/                       # 运营管理后台 Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/      # 数据概览
│   │   │   ├── products/       # 产品管理
│   │   │   ├── users/          # 用户管理
│   │   │   ├── orders/         # 订单管理
│   │   │   ├── settings/       # 系统设置
│   │   │   └── ...
│   │   ├── components/         # 后台专用组件
│   │   ├── lib/
│   │   │   └── api/
│   │   └── types/
│   └── package.json
│
├── backend/                     # Go 后端服务
│   ├── cmd/
│   │   └── server/
│   │       └── main.go         # 主入口
│   ├── internal/
│   │   ├── config/             # 配置管理
│   │   ├── handler/            # HTTP 处理器
│   │   │   ├── v1/             # API v1
│   │   │   │   ├── products/
│   │   │   │   ├── users/
│   │   │   │   ├── orders/
│   │   │   │   └── ...
│   │   │   └── admin/          # 管理员专用 API
│   │   │       ├── product.go
│   │   │       ├── user.go
│   │   │       ├── order.go
│   │   │       └── dashboard.go
│   │   ├── middleware/         # 中间件
│   │   │   ├── auth.go         # 认证
│   │   │   ├── cors.go         # 跨域
│   │   │   ├── rate_limit.go   # 限流
│   │   │   ├── security.go     # 安全防护
│   │   │   └── logger.go       # 日志
│   │   ├── model/              # 数据模型
│   │   ├── repository/         # 数据访问层
│   │   ├── service/            # 业务逻辑层
│   │   └── router/             # 路由定义
│   ├── pkg/                    # 公共工具包
│   ├── migrations/             # 数据库迁移文件
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── nginx/                       # Nginx 配置
│   └── nginx.conf
│
├── docker-compose.yml           # Docker Compose 配置
├── .env.example                # 环境变量示例
├── README.md
├── LICENSE
└── .gitignore
```

---

## 5. 核心功能模块

### 5.1 商城前台功能

| 模块 | 功能列表 |
|------|----------|
| **产品系统** | 产品展示、分类浏览、产品搜索、产品筛选、产品详情 |
| **购物车** | 添加商品、修改数量、删除商品、结算预览 |
| **用户系统** | 注册/登录、个人资料、地址管理、密码重置 |
| **订单系统** | 创建订单、订单支付、订单查询、订单详情 |
| **国际化** | 多语言 (i18n)、多货币支持、地区适配 |
| **营销功能** | 优惠券、促销活动、推荐产品 |

### 5.2 运营管理后台功能

| 模块 | 功能列表 |
|------|----------|
| **数据概览** | 销售报表、用户分析、商品分析、订单趋势 |
| **产品管理** | 产品 CRUD、分类管理、SKU 管理、库存管理、价格管理、上下架 |
| **用户管理** | 用户列表、用户详情、用户状态管理、权限分配、操作记录 |
| **订单管理** | 订单列表、订单详情、发货管理、退款处理、订单状态更新 |
| **系统设置** | 站点配置、支付配置、物流配置、运营配置 |

### 5.3 后端 API 功能

| 模块 | 接口概览 |
|------|----------|
| **认证授权** | `POST /api/v1/auth/login`、`POST /api/v1/auth/register`、`POST /api/v1/auth/refresh` |
| **产品** | `GET /api/v1/products`、`GET /api/v1/products/:id`、搜索、筛选 |
| **购物车** | `GET /api/v1/cart`、`POST /api/v1/cart/items`、`PUT/DELETE /api/v1/cart/items/:id` |
| **订单** | `POST /api/v1/orders`、`GET /api/v1/orders`、`GET /api/v1/orders/:id` |
| **用户** | `GET /api/v1/users/me`、`PUT /api/v1/users/me` |
| **后台产品** | `GET/POST/PUT/DELETE /api/admin/products`、`GET /api/admin/products/:id` |
| **后台用户** | `GET /api/admin/users`、`GET /api/admin/users/:id`、`PUT /api/admin/users/:id/status` |
| **后台订单** | `GET /api/admin/orders`、`GET /api/admin/orders/:id`、`PUT /api/admin/orders/:id/status`、退款 |
| **后台数据** | `GET /api/admin/dashboard/stats` |

---

## 6. 安全设计

### 6.1 API 安全
| 措施 | 实现方案 |
|------|----------|
| **Rate Limiting** | Fiber 限流中间件，Redis 存储计数 |
| **CORS** | Nginx 统一反向代理 + Fiber CORS 中间件 |
| **输入验证** | 所有输入参数验证，使用正则表达式和类型检查 |
| **请求大小限制** | 限制上传文件大小、请求体大小 |

### 6.2 认证授权
| 措施 | 实现方案 |
|------|----------|
| **JWT Token** | Access Token (短过期) + Refresh Token (长过期) |
| **权限分级** | RBAC (基于角色的权限控制)：超级管理员、产品运营、客服、财务 |
| **Session 管理** | Redis 存储活跃会话，支持强制登出 |

### 6.3 数据安全
| 措施 | 实现方案 |
|------|----------|
| **防 SQL 注入** | GORM 参数化查询 |
| **防 XSS** | 前端转义 + 后端净化用户输入 |
| **数据加密** | 敏感字段 (密码、支付信息) 使用 bcrypt、AES 加密存储 |
| **HTTPS** | 强制 HTTPS，HSTS 配置 |

### 6.4 防护体系
- **DDoS 缓解**: Nginx 限流 + CDN (可选)
- **恶意攻击检测**: 异常访问日志、IP 黑名单
- **支付安全**: 第三方支付接口集成 (预留)，不存储用户敏感支付信息
- **操作日志**: 所有后台操作记录审计日志

### 6.5 支付安全设计

| 安全措施 | 描述 |
|----------|------|
| **订单金额双重校验** | 前端展示金额 + 后端从数据库再次计算，防止篡改 |
| **防重复支付 (幂等性)** | 每个订单分配唯一支付 ID，同一订单重复支付自动识别拦截 |
| **支付回调验证** | 严格验证第三方支付平台的回调签名，防止伪造回调 |
| **订单状态变更记录** | 每个订单状态变更都记录时间线，可追溯 |
| **敏感数据加密** | 支付相关敏感字段使用 AES 加密存储 |

### 6.6 应急响应与安全审计

| 措施 | 描述 |
|------|------|
| **日志审计** | 所有操作日志永久保留 6 个月，可查询追溯 |
| **操作时间线** | 每个重要操作记录：用户、时间、IP、操作内容 |
| **异常告警** | 监控异常登录、异常订单、高频访问，自动告警 |
| **应急回滚** | 数据库变更有完整回滚方案，故障快速恢复 |

---

## 7. 数据库设计 (核心表)

### 7.1 用户相关表
- `users`: 用户基础信息
- `user_addresses`: 用户收货地址
- `user_sessions`: 会话信息
- `admin_users`: 后台管理员用户
- `admin_roles`: 管理员角色
- `admin_permissions`: 权限定义

### 7.2 产品相关表
- `products`: 产品基础信息
- `product_categories`: 产品分类
- `product_skus`: 产品 SKU
- `product_images`: 产品图片 (仅存储第三方 URL)
- `product_inventories`: 库存信息

### 7.3 订单相关表
- `orders`: 订单主表
- `order_items`: 订单明细
- `order_status_history`: 订单状态变更历史
- `order_refunds`: 退款记录

### 7.4 营销相关表
- `coupons`: 优惠券
- `coupon_usages`: 优惠券使用记录

---

## 8. 部署方案

### 8.1 Docker 部署架构
使用 Docker Compose 统一管理所有服务：

```yaml
# docker-compose.yml (示意)
services:
  mysql:
    image: mysql:8.0
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
  
  backend:
    build: ./backend
    depends_on:
      - mysql
      - redis
  
  frontend:
    build: ./frontend
    depends_on:
      - backend
  
  admin:
    build: ./admin
    depends_on:
      - backend
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - admin
      - backend
```

### 8.2 CORS 跨域解决方案
通过 Nginx 反向代理统一入口，避免跨域问题：

```
用户请求 ──► Nginx:443
              ├─ /api/* ─────► Go Backend:8080
              ├─ /admin/* ───► Admin Frontend:3001
              └─ /* ─────────► Store Frontend:3000
```

---

## 9. 开发优先级

### Phase 1: 核心功能 (MVP)
1. 项目初始化、基础设施搭建
2. 数据库设计与迁移
3. 用户认证与授权
4. 产品浏览与搜索
5. 购物车

### Phase 2: 交易闭环
6. 订单系统
7. 支付接口 (预留设计)

### Phase 3: 管理后台
8. 后台产品管理
9. 后台订单管理
10. 后台用户管理
11. 数据概览

### Phase 4: 增值功能
12. 多语言多货币
13. 营销功能
14. 性能优化
15. 安全加固

---

## 10. 物流平台接口设计

### 10.1 物流平台预留

系统预留与主流跨境物流平台的集成接口，支持灵活对接：

| 物流平台 | 特点 | 集成方式 |
|----------|------|----------|
| **4PX（递四方）** | 跨境电商物流龙头，覆盖广 | API对接 |
| **YunExpress（云途）** | 时效快，轨迹透明 | API对接 |
| **Yanwen（燕文）** | 性价比高 | API对接 |
| **4PX-Sunyou** | 专线服务 | API对接 |
| **17TRACK** | 物流轨迹聚合平台 | API对接 |
| **DHL / UPS / FedEx** | 国际快递巨头 | API对接 |
| **自定义物流** | 支持自有物流渠道 | 手动录入 |

### 10.2 物流接口架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    订单系统                               │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
            ┌───────────────────────────┐
            │     物流服务层            │
            │  (Logistics Service)     │
            │                           │
            │  ┌─────────────────────┐ │
            │  │ 物流接口适配器       │ │
            │  │ (Adapter Pattern)   │ │
            │  └─────────────────────┘ │
            └───────────┬───────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌─────────┐    ┌──────────┐   ┌──────────┐
   │  4PX    │    │ YunExpress│   │ YunExpress│
   │ Adapter │    │ Adapter  │   │ Adapter  │
   └────┬────┘    └────┬─────┘   └────┬─────┘
        │              │               │
        ▼              ▼               ▼
   ┌─────────┐    ┌──────────┐   ┌──────────┐
   │ 4PX API │    │ YunExpress│   │ YunExpress│
   │         │    │   API    │   │   API    │
   └─────────┘    └──────────┘   └──────────┘
```

### 10.3 物流核心功能

| 功能模块 | 描述 |
|----------|------|
| **物流渠道管理** | 配置不同物流渠道、时效、价格区间 |
| **运费计算** | 根据目的地、重量、体积自动计算运费 |
| **面单打印** | 生成物流面单（PDF格式） |
| **批量发货** | 支持批量提交物流订单 |
| **轨迹追踪** | 实时获取物流轨迹，展示给用户 |
| **异常预警** | 物流异常（如清关延误、退回）自动提醒 |

### 10.4 物流 API 接口设计

| 接口 | 方法 | 描述 |
|------|------|------|
| `POST /api/v1/logistics/shipping-rates` | POST | 获取运费报价 |
| `POST /api/v1/logistics/orders` | POST | 创建物流订单 |
| `GET /api/v1/logistics/track/:tracking_number` | GET | 查询物流轨迹 |
| `GET /api/v1/logistics/labels/:order_id` | GET | 获取面单PDF |
| `POST /api/v1/logistics/batch` | POST | 批量发货 |
| `GET /api/v1/admin/logistics/channels` | GET | 获取物流渠道列表 (后台) |
| `POST /api/v1/admin/logistics/channels` | POST | 添加物流渠道 (后台) |

### 10.5 物流数据模型

```go
// 物流渠道配置
type LogisticsChannel struct {
    ID          uint      `json:"id"`
    Code        string    `json:"code"`         // 渠道代码: 4px, yunexpress
    Name        string    `json:"name"`         // 渠道名称
    Description string    `json:"description"`
    IsActive    bool      `json:"is_active"`
    Config      JSON      `json:"config"`       // 渠道配置 (API密钥等)
    CreatedAt   time.Time `json:"created_at"`
}

// 物流轨迹记录
type LogisticsTracking struct {
    ID               uint      `json:"id"`
    OrderID          uint      `json:"order_id"`
    TrackingNumber    string    `json:"tracking_number"`
    ChannelCode      string    `json:"channel_code"`
    Status           string    `json:"status"`
    CurrentLocation  string    `json:"current_location"`
    Events           JSON      `json:"events"`   // 轨迹事件列表
    LastUpdate       time.Time `json:"last_update"`
}
```

### 10.6 物流配置示例 (JSON)

```json
{
  "logistics_channels": [
    {
      "code": "4px_standard",
      "name": "4PX标准专线",
      "is_active": true,
      "config": {
        "api_url": "https://api.4px.com",
        "api_key": "your-api-key",
        "api_secret": "your-api-secret"
      },
      "shipping_rules": {
        "weight_range": "0-30kg",
        "delivery_days": "7-15",
        "price_per_kg": 50.00
      }
    }
  ]
}
```

---

## 11. 简约设计与用户体验规范

### 11.1 简约设计四大原则

| 原则 | 描述 |
|------|------|
| **功能极简** | 只保留核心功能，避免功能堆砌。非核心功能可配置化开关。 |
| **视觉极简** | 干净的排版，充足留白，统一配色。避免过度装饰。 |
| **交互极简** | 操作路径不超过3步。一键完成常用操作。 |
| **文案极简** | 一句话说明，避免长段落。多语言版本控制在同样长度。 |

### 11.2 UI 设计规范

#### 配色方案
- **主色调**: 简约蓝 (#0066FF) 或 高级灰 (#333333)
- **背景色**: 纯白 (#FFFFFF) 或 浅灰 (#F9FAFB)
- **文字色**: 深灰 (#1F2937) 为主要文本，中灰 (#6B7280) 为辅助说明
- **强调色**: 用于按钮和链接，保持视觉统一性

#### 前台设计风格
- **调性**: 清新、专业、可信赖，符合跨境购物调性
- **排版**: 大间距、易读字体、图片优先
- **移动端**: 优先适配，触摸目标最小 44x44pt

#### 后台设计风格
- **调性**: 功能优先、高效简洁、避免过度设计
- **组件库**: 推荐使用 Shadcn/ui (简约风格，定制性强)
- **布局**: 左侧导航 + 内容区域，信息层级清晰

### 11.3 用户旅程设计

#### 购物用户旅程
```
访客 → 浏览产品 → 加购 → 支付 → 查看物流 → 签收
  ↓        ↓         ↓      ↓         ↓
 清晰   一键查看   即时反馈 顺畅  实时轨迹展示
```

#### 客服/运营用户旅程
```
客服 → 快速处理异常订单 → 一键联系用户 → 解决问题
  ↓
运营 → 快速上架新品 → 查看销售数据 → 调整策略
```

### 11.4 新手引导与易用性优化

| 模块 | 优化方案 |
|------|----------|
| **新手引导** | 首次登录后台显示引导教程，可跳过 |
| **FAQ 帮助中心** | 内置常见问题与操作指引 |
| **产品快速添加** | 提供模板导入、一键复制商品功能 |
| **操作提示** | 关键操作有提示信息，防止误操作 |
| **批量操作** | 订单、产品支持批量操作，提升效率 |

---

## 12. 性能与可靠性设计

### 12.1 缓存策略

| 缓存层级 | 缓存内容 | 缓存策略 |
|----------|----------|----------|
| **Redis** | 产品详情、分类列表、热点数据 | TTL 2小时，主动更新失效 |
| **CDN** | 静态资源、产品图片 | 长期缓存，使用版本号更新 |
| **浏览器** | 静态资源、API 响应 | 合理配置 Cache-Control |

### 12.2 数据库优化

| 优化项 | 方案 |
|--------|------|
| **索引设计** | 关键字段建立索引，查询优化 |
| **分表分库预留** | 订单表设计支持未来分表 |
| **读写分离预留** | 支持主从架构，查询走从库 |

### 12.3 健康检查与监控

```
┌─────────────────────────────────────────┐
│         /health 接口                    │
└─────────────────────────────────────────┘
├─ 数据库连接检查
├─ Redis 连接检查
├─ 磁盘空间检查
└─ 内存使用率检查
```

### 12.4 数据备份策略

| 备份类型 | 策略 |
|----------|------|
| **每日全量备份** | 保留 7 天 |
| **增量备份** | 保留 30 天 |
| **异地备份** | 关键数据定期同步到异地 |
| **备份测试** | 定期验证备份文件可恢复 |

### 12.5 熔断与限流策略

| 措施 | 方案 |
|------|------|
| **接口限流** | 普通接口 60 req/min；敏感接口 10 req/min |
| **熔断机制** | 下游服务错误率超过阈值时自动熔断 |
| **降级策略** | 非核心功能可降级返回缓存数据 |

---

## 13. 后续可扩展方向

- 支付网关集成 (PayPal、Stripe、Alipay International)
- 物流平台对接 ✅ 已在本文档预留设计
- 评论评分系统
- 商品推荐算法
- 数据大屏
- 移动端 APP

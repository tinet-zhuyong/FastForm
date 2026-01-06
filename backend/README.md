# FastForm 后端服务

基于 Node.js + Express 的后端 API 服务。

## 目录结构

```
backend/
├── src/
│   ├── controllers/      # 控制器层 - 处理 HTTP 请求
│   ├── services/         # 服务层 - 业务逻辑
│   ├── routes/           # 路由定义
│   ├── middleware/       # 中间件
│   └── server.js         # 服务器入口文件
├── .env.example          # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 3. 启动服务

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API 端点

### 健康检查
- `GET /health` - 服务健康检查

### 问卷相关
- `GET /api/surveys` - 获取所有问卷
- `GET /api/surveys/:id` - 获取指定问卷
- `POST /api/surveys` - 创建问卷
- `PUT /api/surveys/:id` - 更新问卷
- `DELETE /api/surveys/:id` - 删除问卷
- `GET /api/surveys/:id/analytics` - 获取问卷统计

### 用户相关
- `POST /api/users/login` - 用户登录
- `POST /api/users/register` - 用户注册
- `GET /api/users/profile` - 获取用户信息

## 架构说明

### 分层架构

1. **路由层 (Routes)**: 定义 API 端点和路由规则
2. **控制器层 (Controllers)**: 处理 HTTP 请求和响应
3. **服务层 (Services)**: 实现业务逻辑
4. **中间件 (Middleware)**: 处理跨切面关注点（错误处理、认证等）

### 设计原则

- **单一职责**: 每个模块只负责一个功能
- **依赖注入**: 服务层独立于控制器
- **错误处理**: 统一的错误处理机制
- **可扩展性**: 易于添加新功能和模块

## 后续扩展

- [ ] 集成数据库（MongoDB/PostgreSQL）
- [ ] 添加 JWT 认证
- [ ] 实现数据验证
- [ ] 添加日志系统
- [ ] 编写单元测试
- [ ] API 文档（Swagger）

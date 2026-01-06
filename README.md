# FastForm - 在线问卷系统

FastForm 是一个基于 React + Node.js + PostgreSQL 的全栈在线问卷系统，支持表单创建、分享、填写和数据分析。

## 📋 项目概述

FastForm 提供了完整的问卷管理解决方案，从表单创建到数据收集和分析，为用户提供流畅的使用体验。

---

## 🎨 前端功能实现

### 1. 用户认证模块

#### 📄 登录页面
- **文件**: `src/pages/Login/Login.jsx`
- **样式**: `src/pages/Login/Login.css`
- **功能**: 用户登录、密码加密（SHA-256）、自动跳转

#### 📄 注册页面
- **文件**: `src/pages/Register/Register.jsx`
- **样式**: `src/pages/Register/Register.css`
- **功能**: 用户注册、表单验证、密码确认

#### 🔒 路由保护
- **文件**: `src/components/ProtectedRoute/ProtectedRoute.jsx`
- **功能**: 未登录用户自动跳转到登录页

#### 🛠️ 认证工具
- **文件**: `src/utils/auth.js`
- **功能**: 用户信息存储（localStorage）、登录状态检查

---

### 2. 表单管理模块

#### 📄 表单列表页（Space）
- **文件**: `src/pages/Space/Space.jsx`
- **样式**: `src/pages/Space/Space.css`
- **功能**:
  - 展示用户创建的所有表单
  - 搜索（按标题或 formId）
  - 分页（每页 10 条）
  - 表单操作：编辑、删除、发布/停用、复制链接、查看数据

#### 📄 表单创建/编辑页
- **文件**: `src/pages/FormCreate/FormCreate.jsx`
- **样式**: `src/pages/FormCreate/FormCreate.css`
- **功能**:
  - JSON 配置输入
  - 实时预览
  - 表单验证（实时校验）
  - 支持三种题型：单选、多选、下拉选择
  - 编辑模式（通过 URL 参数 `?id=formId`）

#### 🛠️ 表单验证器
- **文件**: `src/utils/formValidator.js`
- **功能**:
  - 必填字段检查
  - 数据类型验证
  - 问题 ID 唯一性检查
  - 选项 ID 唯一性检查
  - 详细错误提示

---

### 3. 表单填写模块

#### 📄 表单填写页（公开访问）
- **文件**: `src/pages/FormFill/FormFill.jsx`
- **样式**: `src/pages/FormFill/FormFill.css`
- **功能**:
  - 通过 URL 访问表单（`/form/:url`）
  - 支持单选题、多选题、下拉选择题
  - 必填验证
  - 防重复提交（4层防护 + 唯一令牌）
  - 提交成功页面

---

### 4. 数据分析模块

#### 📄 数据查看页
- **文件**: `src/pages/FormDataView/FormDataView.jsx`
- **样式**: `src/pages/FormDataView/FormDataView.css`
- **功能**:
  - 统计概览（总提交数、最早/最近提交时间）
  - 时间范围筛选
  - 表格展示提交数据
  - 分页（每页 20 条）
  - CSV 导出（支持中文 UTF-8 BOM）
  - 权限控制（仅创建者可查看）

---

### 5. 配置和工具

#### ⚙️ API 配置
- **文件**: `src/config.js`
- **功能**: API 端点配置、超时设置

#### 🎨 全局样式
- **文件**: `src/index.css`
- **功能**: 全局样式、CSS 变量

#### 🚀 应用入口
- **文件**: `src/App.jsx`
- **功能**: 路由配置、页面导航

#### 📦 主入口
- **文件**: `src/main.jsx`
- **功能**: React 应用挂载

---

## 🔧 后端功能实现

### 1. 服务器配置

#### 🌐 主服务器
- **文件**: `backend/src/server.js`
- **功能**: Express 服务器、中间件配置、路由注册

#### ⚙️ 应用配置
- **文件**: `backend/src/config/index.js`
- **功能**: 环境变量、CORS 配置、端口设置

#### 🗄️ 数据库配置
- **文件**: `backend/src/config/database.js`
- **功能**: PostgreSQL 连接池、查询封装、连接测试

#### 🔧 数据库初始化
- **文件**: `backend/src/scripts/initDatabase.js`
- **功能**: 创建表结构（users、forms、submissions）、触发器

---

### 2. 用户模块

#### 🛣️ 用户路由
- **文件**: `backend/src/routes/user.routes.js`
- **功能**: 用户相关路由定义

#### 🎮 用户控制器
- **文件**: `backend/src/controllers/user.controller.js`
- **功能**: 登录、注册请求处理

#### 💼 用户服务
- **文件**: `backend/src/services/user.service.js`
- **功能**: 用户业务逻辑、密码加密、数据库操作

---

### 3. 表单模块

#### 🛣️ 表单路由
- **文件**: `backend/src/routes/survey.routes.js`
- **功能**: 表单 CRUD 路由定义

#### 🎮 表单控制器
- **文件**: `backend/src/controllers/survey.controller.js`
- **功能**: 表单请求处理、参数验证

#### 💼 表单服务
- **文件**: `backend/src/services/survey.service.js`
- **功能**:
  - 创建表单
  - 获取表单列表（支持搜索、分页）
  - 获取单个表单（按 ID 或 URL）
  - 更新表单
  - 删除表单（软删除）
  - 发布/停用表单

---

### 4. 提交模块

#### 🛣️ 提交路由
- **文件**: `backend/src/routes/submission.routes.js`
- **功能**: 提交相关路由定义

#### 🎮 提交控制器
- **文件**: `backend/src/controllers/submission.controller.js`
- **功能**: 提交请求处理、数据验证

#### 💼 提交服务
- **文件**: `backend/src/services/submission.service.js`
- **功能**:
  - 创建提交记录
  - 防重复提交（submitToken 验证）
  - 获取表单提交记录（支持时间筛选、分页）
  - 获取提交统计数据

---

### 5. 中间件和工具

#### 🛡️ 错误处理中间件
- **文件**: `backend/src/middleware/errorHandler.js`
- **功能**: 统一错误处理、错误响应格式化

#### 🚦 路由索引
- **文件**: `backend/src/routes/index.js`
- **功能**: 路由模块整合、API 根路由

---

## 🗄️ 数据库设计

### 表结构

#### 👤 用户表 (users)
- `userId` (UUID, 主键)
- `username` (唯一)
- `password` (SHA-256 加密)
- `role` (admin/normal)
- `email` (唯一)
- `createdAt`, `updatedAt`

#### 📋 表单表 (forms)
- `formId` (UUID, 主键)
- `title` (唯一)
- `description`
- `jsonSchema` (JSONB)
- `createType` (template/blank/json)
- `status` (draft/active/deleted)
- `url` (唯一)
- `createUserId` (外键 → users)
- `createdAt`, `updatedAt`, `publishTime`

#### 📝 提交记录表 (submissions)
- `submissionId` (UUID, 主键)
- `formId` (外键 → forms)
- `responseData` (JSONB)
- `submitToken` (唯一，防重复提交)
- `ipAddress`
- `userAgent`
- `submittedAt`

---

## 📦 测试数据

### 示例文件
- `data/MBTI测评.json` - MBTI 性格测试问卷
- `data/TEST.json` - 测试问卷
- `data/示例-下拉选择框.json` - 下拉选择框示例
- `data/测试-正确格式.json` - 正确格式示例
- `data/测试-重复ID错误.json` - 错误格式示例（用于测试验证）

---

## 🎯 核心功能特性

### ✅ 用户认证
- SHA-256 密码加密
- JWT 或 Session 管理
- 路由保护

### ✅ 表单管理
- JSON 配置创建表单
- 实时预览
- 完善的表单验证
- 支持三种题型（单选、多选、下拉）
- 表单状态管理（草稿、已发布、已删除）

### ✅ 表单填写
- 公开访问链接
- 防重复提交（前端4层 + 后端令牌验证）
- 必填验证
- 友好的用户界面

### ✅ 数据分析
- 统计概览
- 时间筛选
- 分页浏览
- CSV 导出（支持中文）
- 权限控制

### ✅ 安全性
- 密码加密
- SQL 注入防护（参数化查询）
- CORS 配置
- 防重复提交
- 权限验证

---

## 📊 技术栈

### 前端
- **框架**: React 18
- **路由**: React Router v6
- **HTTP**: Axios
- **构建**: Vite
- **样式**: CSS Modules

### 后端
- **运行时**: Node.js
- **框架**: Express
- **数据库**: PostgreSQL
- **ORM**: 原生 SQL（pg 库）

### 开发工具
- **包管理**: npm
- **环境变量**: dotenv
- **代码规范**: ESLint

---

## 🚀 快速开始

### 环境要求
- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm >= 6.x

### 安装步骤

#### 1. 克隆项目
```bash
git clone <repository-url>
cd FastForm
```

#### 2. 安装前端依赖
```bash
npm install
```

#### 3. 安装后端依赖
```bash
cd backend
npm install
```

#### 4. 配置数据库
创建 `backend/.env` 文件：
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastform
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
```

#### 5. 初始化数据库
```bash
cd backend
npm run db:init
```

#### 6. 启动后端服务
```bash
cd backend
npm start
```

#### 7. 启动前端服务
```bash
# 在项目根目录
npm run dev
```

#### 8. 访问应用
- 前端: http://localhost:5173
- 后端: http://localhost:3000

---

## 📈 项目统计

- **前端页面**: 6 个（Login, Register, Space, FormCreate, FormFill, FormDataView）
- **后端路由**: 3 个模块（users, surveys, submissions）
- **数据库表**: 3 个（users, forms, submissions）
- **工具函数**: 2 个（auth.js, formValidator.js）
- **总代码文件**: 30+ 个

---

## 📝 JSON 配置示例

### 表单配置格式
```json
{
  "survey1": {
    "title": "用户满意度调查",
    "description": "请填写您对我们服务的满意度",
    "questions": [
      {
        "id": "q1",
        "question": "您的性别是？",
        "options": [
          { "id": "A", "text": "男" },
          { "id": "B", "text": "女" }
        ]
      },
      {
        "id": "q2",
        "question": "您的年龄段是？",
        "select": [
          { "id": "A", "text": "18-25岁" },
          { "id": "B", "text": "26-35岁" }
        ]
      },
      {
        "id": "q3",
        "question": "您感兴趣的领域？（多选）",
        "multioptions": [
          { "id": "A", "text": "科技" },
          { "id": "B", "text": "体育" }
        ]
      }
    ]
  }
}
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 👥 作者

FastForm Team

---

**这是一个功能完整、架构清晰的全栈问卷系统！** 🎉

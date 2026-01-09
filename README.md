# FastForm - 在线问卷系统

FastForm 是一个基于 **React + Express + PostgreSQL** 的全栈在线问卷系统，采用前后端分离架构，提供完整的表单创建、分享、填写和数据分析功能。

## 📋 项目概述

FastForm 提供了完整的问卷管理解决方案，从表单创建到数据收集和分析，为用户提供流畅的使用体验。

### 🎯 核心功能
- ✅ **用户认证** - 注册、登录、权限管理
- ✅ **表单管理** - 创建、编辑、发布、星标、回收站
- ✅ **表单填写** - 公开访问、防重复提交、多种题型
- ✅ **数据分析** - 统计报告、图表可视化、数据导出
- ✅ **安全机制** - 密码加密、SQL防注入、权限控制

### 📚 项目文档
- [📖 项目架构与流程说明](docs/项目架构与流程说明.md) - 详细的技术架构和实现思路
- [📊 业务流程图详解](docs/业务流程图详解.md) - 完整的业务流程图
- [📈 数据概览页面功能说明](docs/数据概览页面功能说明.md) - 数据分析功能详解
- [⭐ 星标和回收站功能说明](docs/星标和回收站功能说明.md) - 表单管理功能详解
- [📝 快速参考手册](docs/快速参考手册.md) - API接口、常用命令、故障排查
- [📋 项目总结](docs/项目总结.md) - 项目概况、技术亮点、经验总结
- [🔧 退出登录跳转问题修复](docs/退出登录跳转问题修复.md) - 问题修复记录
- [✅ 功能测试清单](docs/功能测试清单.md) - 完整的测试用例

---

## 🏗️ 项目架构

### 整体架构
```
用户层 (管理员/创建者/填写者)
    ↓
前端层 (React + Vite)
    ├─ 页面组件 (Pages)
    ├─ 公共组件 (Components)
    └─ 工具函数 (Utils)
    ↓ HTTP/HTTPS
后端层 (Express)
    ├─ 路由层 (Routes)
    ├─ 控制器层 (Controllers)
    ├─ 服务层 (Services)
    └─ 中间件 (Middleware)
    ↓ SQL
数据层 (PostgreSQL)
    ├─ users (用户表)
    ├─ forms (表单表)
    └─ submissions (提交记录表)
```

### 设计模式
- **MVC架构** - 模型-视图-控制器分离
- **三层架构** - 表现层、业务层、数据层
- **RESTful API** - 标准化的API设计
- **前后端分离** - 独立开发、独立部署

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
  - 三个标签页：全部问卷、星标问卷、回收站
  - 展示用户创建的所有表单
  - 显示答卷数量（实时统计）
  - 搜索（按标题或 formId）
  - 分页（每页 10 条）
  - 表单操作：星标、编辑、删除、发布/停用、复制链接、查看数据
  - 回收站操作：恢复、永久删除

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
  - **数据查询报告**
    - 统计概览（总提交数、最早/最近提交时间）
    - 时间范围筛选
    - 表格展示提交数据
    - 分页（每页 10 条）
    - CSV 导出（支持中文 UTF-8 BOM）
  - **统计分析报告**
    - 自定义选择要分析的问题
    - 表格展示（选项、人数、比例）
    - 图表可视化（饼图、柱状图、条形图）
    - Excel 导出
  - 权限控制（仅创建者可查看）

#### 📊 图表组件
- **文件**: `src/components/QuestionChart/QuestionChart.jsx`
- **样式**: `src/components/QuestionChart/QuestionChart.css`
- **功能**:
  - 使用 Recharts 渲染图表
  - 支持饼图、柱状图、条形图
  - 交互式图表（hover 显示详情）
  - 按钮控制显示/隐藏

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
```sql
userId          UUID PRIMARY KEY        -- 用户ID
username        VARCHAR(64) UNIQUE      -- 用户名（唯一）
password        VARCHAR(128)            -- 密码（SHA-256加密）
role            VARCHAR(32)             -- 角色（admin/normal）
email           VARCHAR(128) UNIQUE     -- 邮箱（唯一）
createdAt       TIMESTAMP               -- 创建时间
updatedAt       TIMESTAMP               -- 更新时间
```

#### 📋 表单表 (forms)
```sql
formId          UUID PRIMARY KEY        -- 表单ID
title           VARCHAR(255)            -- 表单标题
description     TEXT                    -- 表单描述
jsonSchema      JSONB                   -- 表单配置（JSON格式）
createType      VARCHAR(32)             -- 创建方式（template/blank/json）
status          VARCHAR(32)             -- 状态（draft/active/deleted）
url             VARCHAR(255) UNIQUE     -- 访问URL（唯一）
createUserId    UUID                    -- 创建者ID（外键→users）
isStarred       BOOLEAN                 -- 是否星标
deletedAt       TIMESTAMP               -- 删除时间（软删除）
createdAt       TIMESTAMP               -- 创建时间
updatedAt       TIMESTAMP               -- 更新时间
publishTime     TIMESTAMP               -- 发布时间
```

#### 📝 提交记录表 (submissions)
```sql
submissionId    UUID PRIMARY KEY        -- 提交ID
formId          UUID                    -- 表单ID（外键→forms）
responseData    JSONB                   -- 答案数据（JSON格式）
submitToken     VARCHAR(128) UNIQUE     -- 提交令牌（防重复提交）
ipAddress       VARCHAR(64)             -- IP地址
userAgent       TEXT                    -- 浏览器信息
submittedAt     TIMESTAMP               -- 提交时间
```

### 数据库关系
```
users (1) ──────< (N) forms
                      │
                      │ (1)
                      │
                      └──────< (N) submissions
```

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
- **密码加密** - SHA-256 哈希加密
- **会话管理** - localStorage 存储用户信息
- **路由保护** - ProtectedRoute 组件拦截未登录访问
- **自动跳转** - 已登录用户访问登录页自动跳转

### ✅ 表单管理
- **JSON 配置** - 灵活的表单配置方式
- **实时预览** - 编辑时即时查看效果
- **表单验证** - 完善的格式和逻辑验证
- **三种题型** - 单选、多选、下拉选择
- **状态管理** - 草稿、已发布、已删除
- **星标功能** - 快速标记重要表单
- **回收站** - 软删除机制，支持恢复
- **答卷统计** - 实时显示答卷数量

### ✅ 表单填写
- **公开访问** - 无需登录即可填写
- **防重复提交** - 5层防护机制
  1. 提交按钮禁用
  2. 提交状态标记
  3. 成功后跳转
  4. 唯一令牌生成
  5. 数据库唯一约束
- **必填验证** - 前端实时验证
- **友好界面** - 清晰的UI设计

### ✅ 数据分析
- **数据查询报告**
  - 统计概览（总数、时间范围）
  - 时间筛选
  - 分页浏览（每页10条）
  - CSV 导出（支持中文）
- **统计分析报告**
  - 自定义选择分析问题
  - 表格展示（选项、人数、比例）
  - 图表可视化（饼图、柱状图、条形图）
  - Excel 导出
- **权限控制** - 仅创建者可查看

### ✅ 安全机制
- **密码安全** - SHA-256 加密存储
- **SQL 防注入** - 参数化查询
- **CORS 配置** - 跨域请求控制
- **防重复提交** - 多层防护
- **权限验证** - 数据访问控制
- **软删除** - 数据可恢复

---

## 📊 技术栈

### 前端技术
```
React 18.3.1          - UI框架
React Router 6.x      - 路由管理
Axios                 - HTTP客户端
Vite 7.3.0           - 构建工具
Recharts             - 图表库
XLSX                 - Excel导出
CSS3                 - 样式设计
```

### 后端技术
```
Node.js 14+          - 运行环境
Express 4.x          - Web框架
PostgreSQL 12+       - 关系型数据库
pg                   - PostgreSQL客户端
crypto               - 密码加密
dotenv               - 环境变量管理
cors                 - 跨域处理
```

### 开发工具
```
npm                  - 包管理器
ESLint               - 代码规范
nodemon              - 热重载
Git                  - 版本控制
```

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

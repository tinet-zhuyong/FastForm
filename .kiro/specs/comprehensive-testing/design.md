# 设计文档 - FastForm 全面测试

## 概述

本文档描述了 FastForm 问卷/表单管理系统的全面测试设计。测试策略采用多层次方法，包括单元测试、集成测试和端到端测试，确保系统的正确性、可靠性和安全性。

测试框架选择：
- **后端测试**: Jest + Supertest（用于 API 测试）
- **前端测试**: Vitest + React Testing Library（用于组件测试）
- **属性测试**: fast-check（JavaScript 属性测试库）
- **集成测试**: Jest + Supertest（端到端 API 测试）

## 架构

### 测试层次结构

```
测试金字塔
    ┌─────────────┐
    │  E2E 测试   │  ← 少量，覆盖关键用户流程
    ├─────────────┤
    │  集成测试   │  ← 中等数量，测试模块间交互
    ├─────────────┤
    │  单元测试   │  ← 大量，测试独立功能单元
    └─────────────┘
```

### 测试组织结构

```
project/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── user.service.js
│   │   │   └── user.service.test.js
│   │   ├── controllers/
│   │   └── utils/
│   └── tests/
│       ├── unit/           # 单元测试
│       ├── integration/    # 集成测试
│       └── helpers/        # 测试辅助工具
├── src/
│   ├── utils/
│   │   ├── formValidator.js
│   │   └── formValidator.test.js
│   ├── components/
│   └── pages/
└── tests/
    └── e2e/               # 端到端测试
```

## 组件和接口

### 1. 测试工具模块

#### 1.1 数据生成器（Generators）

用于属性测试的随机数据生成器：

```javascript
// generators.js
import fc from 'fast-check';

// 生成随机用户数据
export const userArbitrary = fc.record({
  username: fc.string({ minLength: 3, maxLength: 20 }),
  password: fc.string({ minLength: 6, maxLength: 50 }),
  email: fc.emailAddress(),
  role: fc.constantFrom('normal', 'admin')
});

// 生成随机表单数据
export const surveyArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 })),
  url: fc.string({ minLength: 5, maxLength: 50 }),
  jsonSchema: validFormSchemaArbitrary
});

// 生成有效的表单 Schema
export const validFormSchemaArbitrary = fc.record({
  title: fc.string({ minLength: 1 }),
  questions: fc.array(questionArbitrary, { minLength: 1 })
});

// 生成问题数据
export const questionArbitrary = fc.record({
  id: fc.uuid(),
  question: fc.string({ minLength: 1 }),
  options: fc.option(fc.array(optionArbitrary, { minLength: 1 })),
  multioptions: fc.option(fc.array(optionArbitrary, { minLength: 1 })),
  select: fc.option(fc.array(optionArbitrary, { minLength: 1 }))
}).filter(q => q.options || q.multioptions || q.select);

// 生成选项数据
export const optionArbitrary = fc.record({
  id: fc.uuid(),
  text: fc.string({ minLength: 1 })
});
```

#### 1.2 测试数据库管理

```javascript
// testDatabase.js
import { query } from '../src/config/database.js';

// 清理测试数据
export async function cleanupTestData() {
  await query('DELETE FROM submissions WHERE 1=1');
  await query('DELETE FROM forms WHERE 1=1');
  await query('DELETE FROM users WHERE 1=1');
}

// 创建测试用户
export async function createTestUser(userData) {
  const result = await query(
    'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [userData.username, userData.password, userData.email, userData.role]
  );
  return result.rows[0];
}

// 创建测试表单
export async function createTestSurvey(surveyData) {
  const result = await query(
    'INSERT INTO forms (title, description, jsonSchema, url, createUserId) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [surveyData.title, surveyData.description, surveyData.jsonSchema, surveyData.url, surveyData.createUserId]
  );
  return result.rows[0];
}
```

#### 1.3 Mock 工具

```javascript
// mocks.js
// Mock 数据库连接（用于测试数据库错误处理）
export function mockDatabaseError() {
  jest.spyOn(database, 'query').mockRejectedValue(new Error('Database connection failed'));
}

// Mock HTTP 请求
export function mockAxiosRequest(response) {
  jest.spyOn(axios, 'post').mockResolvedValue(response);
}
```

### 2. 后端服务测试模块

#### 2.1 用户服务测试

```javascript
// user.service.test.js
describe('User Service', () => {
  // 单元测试
  describe('Unit Tests', () => {
    test('should hash password using SHA-256', () => {
      // 测试密码加密
    });
  });

  // 属性测试
  describe('Property Tests', () => {
    test('Property: successful login returns user info and token', () => {
      // 使用 fast-check 生成随机用户数据
    });
  });
});
```

#### 2.2 表单验证器测试

```javascript
// formValidator.test.js
describe('Form Validator', () => {
  // 单元测试（边界条件）
  describe('Unit Tests - Edge Cases', () => {
    test('should reject form without title', () => {
      // 测试缺少 title
    });
  });

  // 属性测试
  describe('Property Tests', () => {
    test('Property: valid forms pass validation', () => {
      // 生成随机有效表单，验证通过
    });
  });
});
```

### 3. 前端组件测试模块

#### 3.1 路由保护测试

```javascript
// ProtectedRoute.test.jsx
describe('ProtectedRoute', () => {
  test('should redirect to login when not authenticated', () => {
    // 测试未认证重定向
  });

  test('should render children when authenticated', () => {
    // 测试已认证渲染
  });
});
```

#### 3.2 表单创建页面测试

```javascript
// FormCreate.test.jsx
describe('FormCreate Page', () => {
  test('should validate JSON file on upload', () => {
    // 测试文件上传和验证
  });

  test('should display validation errors', () => {
    // 测试错误显示
  });
});
```

## 数据模型

### 测试数据模型

```javascript
// 用户测试数据
const testUser = {
  userId: 1,
  username: 'testuser',
  password: 'hashedpassword',
  email: 'test@example.com',
  role: 'normal'
};

// 表单测试数据
const testSurvey = {
  formId: 1,
  title: 'Test Survey',
  description: 'Test Description',
  jsonSchema: { /* valid schema */ },
  url: 'test-survey',
  createUserId: 1,
  status: 'draft'
};

// 提交测试数据
const testSubmission = {
  submissionId: 1,
  formId: 1,
  responseData: { /* response data */ },
  submitToken: 'unique-token',
  submittedAt: new Date()
};
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性反思

在编写正确性属性之前，我对 prework 分析进行了反思，以消除冗余：

**识别的冗余：**
1. 用户认证中的"成功登录"和"成功注册"都测试返回用户信息和令牌，可以合并为一个通用属性
2. 表单查询中的"通过 ID 查询"和"通过 URL 查询"本质上测试相同的查询逻辑，可以合并
3. 多个"唯一性约束"测试（用户名、邮箱、表单标题、表单 URL）遵循相同模式，可以合并为通用唯一性属性
4. 表单验证中的多个"缺少字段"测试都是边界条件，将在单元测试中覆盖，不需要单独的属性
5. 集成测试中的多个"创建-查询一致性"测试可以合并为一个通用的数据一致性属性

**保留的独特属性：**
- 每个属性提供独特的验证价值
- 覆盖不同的业务逻辑方面
- 测试不同的错误处理场景

### 用户认证属性

**属性 1: 认证成功返回完整用户信息**

*对于任何*有效的用户凭证（用户名和密码），当用户登录或注册成功时，系统应该返回包含 userId、username、email、role 和 token 字段的响应对象。

**验证需求: 1.1, 1.5**

**属性 2: 无效凭证被拒绝**

*对于任何*无效的用户凭证（错误的用户名或密码），系统应该拒绝登录并返回包含错误信息的响应。

**验证需求: 1.2**

**属性 3: 唯一性约束被强制执行**

*对于任何*已存在的唯一字段值（用户名或邮箱），当尝试创建具有相同值的新记录时，系统应该拒绝操作并返回相应的唯一性错误信息。

**验证需求: 1.3, 1.4**

**属性 4: 用户查询的存在性检查**

*对于任何*用户 ID，如果该 ID 存在于系统中，查询应该返回用户信息；如果不存在，应该返回"用户不存在"错误。

**验证需求: 1.6, 1.7**

**属性 5: 密码加密一致性**

*对于任何*密码字符串，系统应该使用 SHA-256 算法进行加密，并且相同的密码应该产生相同的哈希值。

**验证需求: 1.8**

### 表单验证属性

**属性 6: 有效表单通过验证**

*对于任何*结构完整且符合规范的表单 JSON（包含 title、非空 questions 数组、每个问题有唯一 ID 和至少一种选项类型），验证器应该返回 `{ valid: true, errors: [] }`。

**验证需求: 2.1**

**属性 7: 重复 ID 被检测**

*对于任何*包含重复问题 ID 或重复选项 ID 的表单，验证器应该返回包含"id 重复"错误信息的结果。

**验证需求: 2.5, 2.11**

**属性 8: 多错误收集完整性**

*对于任何*包含多个验证错误的表单，验证器应该返回包含所有错误信息的列表，而不是在第一个错误处停止。

**验证需求: 2.12**

### 表单管理属性

**属性 9: 表单创建成功返回 ID**

*对于任何*包含必需字段（title、url、createUserId）的有效表单数据，创建操作应该成功并返回包含 formId 的表单记录。

**验证需求: 3.1**

**属性 10: 表单唯一性约束**

*对于任何*已存在的表单标题或 URL，当尝试创建具有相同值的新表单时，系统应该拒绝操作并返回相应的唯一性错误信息。

**验证需求: 3.2, 3.3**

**属性 11: 表单查询的存在性检查**

*对于任何*表单标识符（formId 或 URL），如果该标识符对应的表单存在且未删除，查询应该返回表单信息；否则应该返回"表单不存在"错误。

**验证需求: 3.4, 3.5, 3.6, 3.7**

**属性 12: 表单更新保持数据一致性**

*对于任何*已存在的表单和有效的更新数据，更新操作应该成功并返回包含更新后字段值的表单记录。

**验证需求: 3.8**

**属性 13: 发布时间自动设置**

*对于任何*状态从非 active 更新为 active 且 publishTime 为空的表单，系统应该自动设置 publishTime 为当前时间戳。

**验证需求: 3.9**

**属性 14: 软删除状态转换**

*对于任何*已存在的表单，删除操作应该将表单的 status 字段设置为 'deleted'，而不是从数据库中物理删除记录。

**验证需求: 3.10**

**属性 15: 用户表单列表过滤**

*对于任何*用户 ID，查询该用户的表单列表应该只返回 createUserId 等于该用户 ID 且 status 不为 'deleted' 的表单。

**验证需求: 3.11**

**属性 16: 表单统计准确性**

*对于任何*表单 ID，统计数据应该准确反映该表单的提交总数、创建时间、发布时间和最近提交时间。

**验证需求: 3.12**

### 表单提交属性

**属性 17: 有效提交创建记录**

*对于任何*已发布表单（status 为 'active'）和有效的响应数据，提交操作应该成功并返回包含 submissionId 的提交记录。

**验证需求: 4.1**

**属性 18: 提交前置条件检查**

*对于任何*提交请求，如果表单不存在或状态不为 'active'，系统应该拒绝提交并返回相应的错误信息。

**验证需求: 4.2, 4.3**

**属性 19: 提交防重复机制**

*对于任何*非空的 submitToken，如果该 token 已经存在于提交记录中，系统应该拒绝提交并返回"请勿重复提交"错误。

**验证需求: 4.4**

**属性 20: 提交记录查询和分页**

*对于任何*表单 ID 和分页参数（page、limit），查询应该返回该表单的提交记录列表，并且返回的记录数量不超过 limit，总记录数和分页信息准确。

**验证需求: 4.5, 4.7**

**属性 21: 提交时间范围过滤**

*对于任何*表单 ID 和时间范围（startDate、endDate），查询应该只返回 submittedAt 在该时间范围内的提交记录。

**验证需求: 4.6**

**属性 22: 提交统计准确性**

*对于任何*表单 ID，提交统计应该准确反映该表单的提交总数、最早提交时间和最晚提交时间。

**验证需求: 4.8**

### 前端组件属性

**属性 23: API 请求包含认证令牌**

*对于任何*需要认证的 API 请求，请求头应该包含有效的认证令牌（Authorization 或自定义 token 字段）。

**验证需求: 5.8**

### 集成测试属性

**属性 24: 创建-查询数据一致性**

*对于任何*成功创建的资源（用户、表单、提交），立即查询该资源应该返回与创建时相同的数据。

**验证需求: 6.2, 6.3**

**属性 25: 删除-查询状态一致性**

*对于任何*被删除的表单，后续查询该表单应该返回"表单不存在"错误或状态为 'deleted' 的记录。

**验证需求: 6.4**

**属性 26: 状态更新-操作权限一致性**

*对于任何*表单，当状态更新为 'active' 后，该表单应该允许提交操作；当状态为其他值时，应该拒绝提交。

**验证需求: 6.5**

### 错误处理属性

**属性 27: 格式错误数据返回明确错误**

*对于任何*格式错误的输入数据（无效 JSON、缺少必填字段、类型错误），系统应该返回包含明确错误描述的响应，而不是抛出未捕获的异常。

**验证需求: 7.1**

**属性 28: 空值和空格验证**

*对于任何*必填字段，如果提供空字符串或只包含空格的字符串，系统应该拒绝并返回验证错误。

**验证需求: 7.4, 7.5**

**属性 29: 权限控制检查**

*对于任何*用户尝试访问不属于自己的资源（表单、提交记录），系统应该拒绝访问并返回权限错误。

**验证需求: 7.7**

### 性能和可靠性属性

**属性 30: 分页正确处理大数据集**

*对于任何*包含大量记录的查询，使用分页参数应该正确返回指定范围的数据，并且查询性能应该不随总记录数线性增长。

**验证需求: 8.2**

## 错误处理

### 错误类型定义

```javascript
// errors.js
export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class DuplicateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DuplicateError';
    this.statusCode = 409;
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}
```

### 错误处理策略

1. **服务层错误**: 抛出特定类型的错误（ValidationError、NotFoundError 等）
2. **控制器层**: 捕获错误并转换为 HTTP 响应
3. **测试断言**: 验证错误类型、消息和状态码

```javascript
// 测试错误处理示例
test('should throw NotFoundError when user not found', async () => {
  await expect(getProfile(999999)).rejects.toThrow(NotFoundError);
  await expect(getProfile(999999)).rejects.toThrow('用户不存在');
});
```

## 测试策略

### 双重测试方法

本项目采用单元测试和属性测试相结合的方法：

**单元测试**:
- 验证特定示例和边界条件
- 测试错误处理路径
- 测试集成点
- 快速执行，提供即时反馈

**属性测试**:
- 验证跨所有输入的通用属性
- 通过随机化实现全面的输入覆盖
- 发现边界情况和意外行为
- 每个属性测试运行最少 100 次迭代

两者互补：单元测试捕获具体的 bug，属性测试验证通用正确性。

### 属性测试配置

使用 fast-check 库进行属性测试：

```javascript
import fc from 'fast-check';

// 属性测试示例
test('Property 1: successful authentication returns complete user info', () => {
  fc.assert(
    fc.property(userArbitrary, async (userData) => {
      // 创建用户
      const user = await register(userData);
      
      // 验证返回字段
      expect(user).toHaveProperty('userId');
      expect(user).toHaveProperty('username', userData.username);
      expect(user).toHaveProperty('email', userData.email);
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('token');
    }),
    { numRuns: 100 } // 运行 100 次迭代
  );
});
```

### 测试标签

每个属性测试必须使用注释标签引用设计文档中的属性：

```javascript
/**
 * Feature: comprehensive-testing, Property 1: 认证成功返回完整用户信息
 * Validates: Requirements 1.1, 1.5
 */
test('Property 1: successful authentication returns complete user info', () => {
  // 测试实现
});
```

### 测试覆盖率目标

- **单元测试覆盖率**: 80% 以上
- **属性测试覆盖率**: 所有核心业务逻辑
- **集成测试覆盖率**: 所有关键用户流程
- **边界条件覆盖**: 所有已知边界情况

### 测试执行策略

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:property": "jest --testPathPattern=property",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### 持续集成

- 每次提交运行所有测试
- Pull Request 必须通过所有测试
- 覆盖率报告自动生成
- 失败的属性测试提供反例用于调试

## 测试环境配置

### 数据库配置

```javascript
// jest.config.js
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ]
};

// tests/setup.js
import { cleanupTestData } from './helpers/testDatabase.js';

beforeEach(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
  // 关闭数据库连接
});
```

### 前端测试配置

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```

## 总结

本测试设计提供了全面的测试策略，涵盖：
- 30 个正确性属性，确保系统行为符合规范
- 单元测试和属性测试的双重方法
- 清晰的测试组织结构和命名约定
- 完整的错误处理和边界条件测试
- 集成测试验证端到端流程

通过这个测试设计，我们可以确保 FastForm 系统的正确性、可靠性和可维护性。

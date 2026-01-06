# 需求文档 - FastForm 全面测试

## 简介

本文档定义了 FastForm 问卷/表单管理系统的全面测试需求。FastForm 是一个包含前端（React + Vite）和后端（Express + PostgreSQL）的全栈应用，支持用户注册登录、表单创建、表单填写、数据查看和分析等功能。

测试范围涵盖：
- 用户认证系统
- 表单验证工具
- 表单 CRUD 操作
- 表单提交系统
- 数据查询和分析
- 前端组件和页面

## 术语表

- **System**: FastForm 问卷/表单管理系统
- **User_Service**: 用户认证和管理服务
- **Survey_Service**: 表单管理服务
- **Submission_Service**: 表单提交记录服务
- **Form_Validator**: 表单 JSON Schema 验证工具
- **Frontend**: React 前端应用
- **Backend**: Express 后端 API 服务
- **Database**: PostgreSQL 数据库
- **JSON_Schema**: 表单的 JSON 数据结构
- **Question**: 表单中的问题项
- **Option**: 问题的选项（单选、多选或下拉）
- **Submission**: 用户提交的表单响应数据
- **Token**: 用户认证令牌或提交防重复令牌

## 需求

### 需求 1: 用户认证功能测试

**用户故事：** 作为系统管理员，我希望验证用户认证系统的正确性，以确保用户数据安全和访问控制有效。

#### 验收标准

1. WHEN 用户使用正确的用户名和密码登录 THEN THE User_Service SHALL 返回包含用户信息和令牌的响应
2. WHEN 用户使用错误的用户名或密码登录 THEN THE User_Service SHALL 拒绝登录并返回错误信息
3. WHEN 用户注册时使用已存在的用户名 THEN THE User_Service SHALL 拒绝注册并返回"用户名已存在"错误
4. WHEN 用户注册时使用已存在的邮箱 THEN THE User_Service SHALL 拒绝注册并返回"邮箱已被使用"错误
5. WHEN 用户成功注册 THEN THE User_Service SHALL 创建新用户记录并返回用户信息和令牌
6. WHEN 查询用户信息时提供有效的用户ID THEN THE User_Service SHALL 返回该用户的完整信息
7. WHEN 查询用户信息时提供无效的用户ID THEN THE User_Service SHALL 返回"用户不存在"错误
8. THE User_Service SHALL 使用 SHA-256 算法对密码进行加密存储

### 需求 2: 表单 Schema 验证功能测试

**用户故事：** 作为开发人员，我希望验证表单 JSON Schema 验证工具的正确性，以确保只有符合规范的表单数据能被系统接受。

#### 验收标准

1. WHEN 验证一个完整且正确的表单 JSON THEN THE Form_Validator SHALL 返回验证通过结果
2. WHEN 验证一个缺少 title 字段的表单 THEN THE Form_Validator SHALL 返回包含"缺少必填字段 title"的错误
3. WHEN 验证一个缺少 questions 字段的表单 THEN THE Form_Validator SHALL 返回包含"缺少必填字段 questions"的错误
4. WHEN 验证一个 questions 为空数组的表单 THEN THE Form_Validator SHALL 返回包含"questions 不能为空"的错误
5. WHEN 验证一个包含重复问题 ID 的表单 THEN THE Form_Validator SHALL 返回包含"id 重复"的错误
6. WHEN 验证一个问题缺少 id 字段 THEN THE Form_Validator SHALL 返回包含"缺少必填字段 id"的错误
7. WHEN 验证一个问题缺少 question 文本 THEN THE Form_Validator SHALL 返回包含"缺少必填字段 question"的错误
8. WHEN 验证一个问题没有任何选项（options、multioptions、select）THEN THE Form_Validator SHALL 返回包含"必须包含选项"的错误
9. WHEN 验证一个选项缺少 id 字段 THEN THE Form_Validator SHALL 返回包含"选项缺少 id"的错误
10. WHEN 验证一个选项缺少 text 字段 THEN THE Form_Validator SHALL 返回包含"选项缺少 text"的错误
11. WHEN 验证一个问题的选项 ID 重复 THEN THE Form_Validator SHALL 返回包含"选项 id 重复"的错误
12. WHEN 验证包含多个错误的表单 THEN THE Form_Validator SHALL 返回所有错误信息的列表

### 需求 3: 表单管理功能测试

**用户故事：** 作为系统管理员，我希望验证表单管理服务的正确性，以确保表单的创建、查询、更新和删除操作正常工作。

#### 验收标准

1. WHEN 创建一个新表单时提供完整的表单数据 THEN THE Survey_Service SHALL 创建表单并返回包含 formId 的表单记录
2. WHEN 创建表单时使用已存在的标题 THEN THE Survey_Service SHALL 拒绝创建并返回"表单标题已存在"错误
3. WHEN 创建表单时使用已存在的 URL THEN THE Survey_Service SHALL 拒绝创建并返回"表单 URL 已存在"错误
4. WHEN 根据有效的 formId 查询表单 THEN THE Survey_Service SHALL 返回该表单的完整信息
5. WHEN 根据无效的 formId 查询表单 THEN THE Survey_Service SHALL 返回"表单不存在"错误
6. WHEN 根据有效的 URL 查询表单 THEN THE Survey_Service SHALL 返回该表单的完整信息
7. WHEN 根据无效的 URL 查询表单 THEN THE Survey_Service SHALL 返回"表单不存在"错误
8. WHEN 更新表单的标题、描述或 JSON Schema THEN THE Survey_Service SHALL 更新表单并返回更新后的记录
9. WHEN 更新表单状态为 active 且 publishTime 为空 THEN THE Survey_Service SHALL 设置 publishTime 为当前时间
10. WHEN 删除一个表单 THEN THE Survey_Service SHALL 将表单状态设置为 deleted（软删除）
11. WHEN 查询用户的所有表单 THEN THE Survey_Service SHALL 返回该用户创建的所有未删除表单列表
12. WHEN 获取表单统计数据 THEN THE Survey_Service SHALL 返回包含提交总数、创建时间、发布时间和最近提交时间的统计信息

### 需求 4: 表单提交功能测试

**用户故事：** 作为系统管理员，我希望验证表单提交服务的正确性，以确保用户提交的数据能被正确记录和查询。

#### 验收标准

1. WHEN 用户提交一个已发布表单的响应数据 THEN THE Submission_Service SHALL 创建提交记录并返回包含 submissionId 的记录
2. WHEN 用户提交一个不存在的表单 THEN THE Submission_Service SHALL 拒绝提交并返回"表单不存在"错误
3. WHEN 用户提交一个未发布的表单 THEN THE Submission_Service SHALL 拒绝提交并返回"表单未发布或已停用"错误
4. WHEN 用户使用相同的 submitToken 重复提交 THEN THE Submission_Service SHALL 拒绝提交并返回"请勿重复提交"错误
5. WHEN 查询表单的所有提交记录 THEN THE Submission_Service SHALL 返回该表单的所有提交记录和分页信息
6. WHEN 查询表单提交记录时指定时间范围 THEN THE Submission_Service SHALL 只返回该时间范围内的提交记录
7. WHEN 查询表单提交记录时指定分页参数 THEN THE Submission_Service SHALL 返回指定页码和每页数量的记录
8. WHEN 获取表单提交统计 THEN THE Submission_Service SHALL 返回包含总数、最早提交时间和最晚提交时间的统计信息

### 需求 5: 前端组件功能测试

**用户故事：** 作为前端开发人员，我希望验证前端组件的正确性，以确保用户界面交互和数据展示正常工作。

#### 验收标准

1. WHEN 用户访问登录页面且已认证 THEN THE Frontend SHALL 重定向到用户空间页面
2. WHEN 用户访问受保护的路由且未认证 THEN THE Frontend SHALL 重定向到登录页面
3. WHEN 用户在表单创建页面上传 JSON 文件 THEN THE Frontend SHALL 验证 JSON 格式并显示验证结果
4. WHEN 用户在表单创建页面上传无效的 JSON 文件 THEN THE Frontend SHALL 显示详细的错误信息
5. WHEN 用户在表单填写页面提交响应 THEN THE Frontend SHALL 发送数据到后端并显示提交结果
6. WHEN 用户在数据查看页面查看提交记录 THEN THE Frontend SHALL 展示所有提交记录的列表
7. WHEN 用户在用户空间页面查看表单列表 THEN THE Frontend SHALL 展示该用户创建的所有表单
8. THE Frontend SHALL 在所有 API 请求中包含认证令牌

### 需求 6: 集成测试

**用户故事：** 作为系统管理员，我希望验证系统各模块之间的集成正确性，以确保端到端的业务流程正常工作。

#### 验收标准

1. WHEN 用户完成注册、登录、创建表单、发布表单、填写表单、查看数据的完整流程 THEN THE System SHALL 在每个步骤都正确处理并返回预期结果
2. WHEN 用户创建表单后立即查询该表单 THEN THE System SHALL 返回刚创建的表单数据
3. WHEN 用户提交表单后立即查询提交记录 THEN THE System SHALL 返回刚提交的记录
4. WHEN 用户删除表单后尝试查询该表单 THEN THE System SHALL 返回"表单不存在"错误
5. WHEN 用户更新表单状态为 active 后尝试提交该表单 THEN THE System SHALL 成功接受提交

### 需求 7: 错误处理和边界条件测试

**用户故事：** 作为系统管理员，我希望验证系统的错误处理和边界条件处理能力，以确保系统在异常情况下的稳定性。

#### 验收标准

1. WHEN 系统接收到格式错误的 JSON 数据 THEN THE System SHALL 返回明确的错误信息而不是崩溃
2. WHEN 系统接收到超大的表单数据 THEN THE System SHALL 正确处理或返回合理的错误信息
3. WHEN 数据库连接失败 THEN THE System SHALL 返回服务不可用错误而不是暴露内部错误
4. WHEN 用户提供空字符串作为必填字段 THEN THE System SHALL 拒绝并返回验证错误
5. WHEN 用户提供只包含空格的字符串作为必填字段 THEN THE System SHALL 拒绝并返回验证错误
6. WHEN 系统处理并发请求时 THEN THE System SHALL 正确处理每个请求而不产生数据竞争
7. WHEN 用户尝试访问不属于自己的资源 THEN THE System SHALL 拒绝访问并返回权限错误

### 需求 8: 性能和可靠性测试

**用户故事：** 作为系统管理员，我希望验证系统的性能和可靠性，以确保系统能够处理预期的负载。

#### 验收标准

1. WHEN 系统处理大量并发用户登录请求 THEN THE System SHALL 在合理时间内响应所有请求
2. WHEN 系统查询包含大量提交记录的表单 THEN THE System SHALL 使用分页正确返回数据
3. WHEN 系统验证包含大量问题的表单 THEN THE Form_Validator SHALL 在合理时间内完成验证
4. WHEN 系统连续处理多个请求 THEN THE System SHALL 不出现内存泄漏
5. THE System SHALL 在数据库查询中使用参数化查询防止 SQL 注入

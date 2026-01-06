# Requirements Document

## Introduction

为 FastForm 系统添加表单数据查看和导出功能，让表单创建者能够查看、筛选和导出用户提交的表单数据。

## Glossary

- **System**: FastForm 表单管理系统
- **Form_Creator**: 创建表单的用户
- **Submission**: 用户提交的表单答案记录
- **Data_View_Page**: 数据查看页面
- **CSV_Export**: 将数据导出为 CSV 格式文件

## Requirements

### Requirement 1: 数据查看入口

**User Story:** 作为表单创建者，我想要在表单列表页面看到"数据"按钮，以便快速进入数据查看页面。

#### Acceptance Criteria

1. WHEN 表单创建者查看表单列表 THEN THE System SHALL 在每个表单的操作栏显示"数据"按钮
2. WHEN 表单创建者点击"数据"按钮 THEN THE System SHALL 跳转到该表单的数据查看页面
3. WHEN 表单没有任何提交记录 THEN THE System SHALL 仍然允许访问数据查看页面并显示空状态

### Requirement 2: 提交数据展示

**User Story:** 作为表单创建者，我想要以表格形式查看所有提交记录，以便了解用户的回答情况。

#### Acceptance Criteria

1. WHEN 表单创建者进入数据查看页面 THEN THE System SHALL 以表格形式展示所有提交记录
2. WHEN 展示提交数据 THEN THE System SHALL 将每行显示为一次提交，每列显示为一个问题的答案
3. WHEN 展示提交数据 THEN THE System SHALL 包含提交时间、IP地址等元数据列
4. WHEN 问题为多选题 THEN THE System SHALL 将多个选项用逗号分隔显示
5. WHEN 表格数据过多 THEN THE System SHALL 支持横向滚动查看所有列

### Requirement 3: 时间范围筛选

**User Story:** 作为表单创建者，我想要按时间范围筛选提交记录，以便查看特定时间段的数据。

#### Acceptance Criteria

1. WHEN 表单创建者在数据查看页面 THEN THE System SHALL 提供开始时间和结束时间的筛选输入框
2. WHEN 表单创建者选择时间范围并点击筛选 THEN THE System SHALL 只显示该时间范围内的提交记录
3. WHEN 表单创建者清空时间筛选 THEN THE System SHALL 显示所有提交记录
4. WHEN 开始时间晚于结束时间 THEN THE System SHALL 显示错误提示

### Requirement 4: 分页功能

**User Story:** 作为表单创建者，我想要分页浏览提交数据，以便在数据量大时提高加载速度。

#### Acceptance Criteria

1. WHEN 提交记录超过每页显示数量 THEN THE System SHALL 显示分页控件
2. WHEN 表单创建者点击下一页 THEN THE System SHALL 加载并显示下一页的数据
3. WHEN 表单创建者点击上一页 THEN THE System SHALL 加载并显示上一页的数据
4. THE System SHALL 每页显示 20 条记录
5. WHEN 显示分页信息 THEN THE System SHALL 显示当前页码、总页数和总记录数

### Requirement 5: CSV 数据导出

**User Story:** 作为表单创建者，我想要将表单数据导出为 CSV 文件，以便在 Excel 中进一步分析。

#### Acceptance Criteria

1. WHEN 表单创建者在数据查看页面 THEN THE System SHALL 显示"导出 CSV"按钮
2. WHEN 表单创建者点击"导出 CSV"按钮 THEN THE System SHALL 生成包含所有筛选后数据的 CSV 文件
3. WHEN 生成 CSV 文件 THEN THE System SHALL 包含表头行（问题文本）
4. WHEN 生成 CSV 文件 THEN THE System SHALL 包含所有提交记录的答案数据
5. WHEN 生成 CSV 文件 THEN THE System SHALL 使用 UTF-8 BOM 编码以支持中文
6. WHEN CSV 文件生成完成 THEN THE System SHALL 自动下载文件到用户本地
7. THE System SHALL 将 CSV 文件命名为 "表单标题_提交数据_日期时间.csv"

### Requirement 6: 数据统计概览

**User Story:** 作为表单创建者，我想要看到提交数据的统计概览，以便快速了解整体情况。

#### Acceptance Criteria

1. WHEN 表单创建者进入数据查看页面 THEN THE System SHALL 显示总提交数
2. WHEN 表单创建者进入数据查看页面 THEN THE System SHALL 显示最早提交时间
3. WHEN 表单创建者进入数据查看页面 THEN THE System SHALL 显示最近提交时间
4. WHEN 应用时间筛选 THEN THE System SHALL 更新统计数据以反映筛选后的结果

### Requirement 7: 权限控制

**User Story:** 作为系统管理员，我想要确保只有表单创建者能查看其表单数据，以便保护用户隐私。

#### Acceptance Criteria

1. WHEN 用户尝试访问数据查看页面 THEN THE System SHALL 验证用户是否为该表单的创建者
2. WHEN 用户不是表单创建者 THEN THE System SHALL 拒绝访问并显示错误提示
3. WHEN 用户未登录 THEN THE System SHALL 重定向到登录页面

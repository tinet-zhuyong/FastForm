import { query, testConnection, closePool } from '../config/database.js';

/**
 * 初始化数据库表结构
 */
const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');

    // 测试连接
    const connected = await testConnection();
    if (!connected) {
      throw new Error('数据库连接失败');
    }

    // 1. 启用 UUID 扩展
    await query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    console.log('✅ UUID 扩展已启用');

    // 2. 创建用户表
    await query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "userId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "username" VARCHAR(64) NOT NULL,
        "password" VARCHAR(128) NOT NULL,
        "role" VARCHAR(32) NOT NULL DEFAULT 'normal' CHECK ("role" IN ('admin', 'normal')),
        "email" VARCHAR(128),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uk_users_username UNIQUE ("username"),
        CONSTRAINT uk_users_email UNIQUE ("email")
      )
    `);
    console.log('✅ 用户表创建成功');

    // 3. 创建表单表（Form）- 依赖 User 表
    await query(`
      CREATE TABLE IF NOT EXISTS "forms" (
        "formId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "jsonSchema" JSONB NOT NULL,
        "createType" VARCHAR(32) NOT NULL DEFAULT 'blank' CHECK ("createType" IN ('template', 'blank', 'json')),
        "templateId" UUID,
        "status" VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'active', 'deleted')),
        "url" VARCHAR(255) NOT NULL,
        "createUserId" UUID NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "publishTime" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT fk_forms_createUserId FOREIGN KEY ("createUserId") REFERENCES "users" ("userId") ON DELETE CASCADE,
        CONSTRAINT uk_forms_title UNIQUE ("title"),
        CONSTRAINT uk_forms_url UNIQUE ("url")
      )
    `);
    console.log('✅ 表单表创建成功');

    // 4. 创建提交记录表（Submission）- 依赖 Form 表
    await query(`
      CREATE TABLE IF NOT EXISTS "submissions" (
        "submissionId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "formId" UUID NOT NULL,
        "responseData" JSONB NOT NULL,
        "submitToken" VARCHAR(128),
        "ipAddress" VARCHAR(64) NOT NULL,
        "userAgent" TEXT NOT NULL,
        "submittedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_submissions_formId FOREIGN KEY ("formId") REFERENCES "forms" ("formId") ON DELETE CASCADE,
        CONSTRAINT uk_submissions_submitToken UNIQUE ("submitToken")
      )
    `);
    console.log('✅ 提交记录表创建成功');

    // 5. 创建索引以提升查询性能
    await query(`
      CREATE INDEX IF NOT EXISTS idx_forms_createUserId ON "forms"("createUserId");
      CREATE INDEX IF NOT EXISTS idx_forms_status ON "forms"("status");
      CREATE INDEX IF NOT EXISTS idx_submissions_formId ON "submissions"("formId");
      CREATE INDEX IF NOT EXISTS idx_submissions_submittedAt ON "submissions"("submittedAt");
    `);
    console.log('✅ 索引创建成功');

    // 6. 创建更新时间触发器函数
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    console.log('✅ 更新时间触发器函数创建成功');

    // 7. 为用户表添加更新时间触发器
    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON "users"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ 用户表更新时间触发器创建成功');

    // 8. 为表单表添加更新时间触发器
    await query(`
      DROP TRIGGER IF EXISTS update_forms_updated_at ON "forms";
      CREATE TRIGGER update_forms_updated_at
        BEFORE UPDATE ON "forms"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ 表单表更新时间触发器创建成功');

    console.log('🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    console.error('错误详情:', error.message);
  } finally {
    await closePool();
  }
};

// 执行初始化
initDatabase();

import { query, testConnection, closePool } from '../config/database.js';

/**
 * 数据库迁移脚本 - 添加星标和回收站功能
 */
const migrateDatabase = async () => {
  try {
    console.log('开始数据库迁移...');

    // 测试连接
    const connected = await testConnection();
    if (!connected) {
      throw new Error('数据库连接失败');
    }

    // 1. 添加 isStarred 字段
    try {
      await query(`
        ALTER TABLE "forms" 
        ADD COLUMN IF NOT EXISTS "isStarred" BOOLEAN NOT NULL DEFAULT false;
      `);
      console.log('✅ isStarred 字段添加成功');
    } catch (error) {
      console.log('⚠️  isStarred 字段可能已存在:', error.message);
    }

    // 2. 添加 deletedAt 字段
    try {
      await query(`
        ALTER TABLE "forms" 
        ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE;
      `);
      console.log('✅ deletedAt 字段添加成功');
    } catch (error) {
      console.log('⚠️  deletedAt 字段可能已存在:', error.message);
    }

    // 3. 创建索引以提升查询性能
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_forms_isStarred ON "forms"("isStarred");
        CREATE INDEX IF NOT EXISTS idx_forms_deletedAt ON "forms"("deletedAt");
      `);
      console.log('✅ 索引创建成功');
    } catch (error) {
      console.log('⚠️  索引可能已存在:', error.message);
    }

    console.log('🎉 数据库迁移完成！');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    console.error('错误详情:', error.message);
  } finally {
    await closePool();
  }
};

// 执行迁移
migrateDatabase();

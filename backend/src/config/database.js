import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * PostgreSQL 数据库连接池配置
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fastform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间
  connectionTimeoutMillis: 2000, // 连接超时时间
});

/**
 * 测试数据库连接
 */
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ 数据库连接成功');
    const result = await client.query('SELECT NOW()');
    console.log('📅 数据库时间:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

/**
 * 执行查询
 * @param {string} text - SQL 查询语句
 * @param {Array} params - 查询参数
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('执行查询:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('查询错误:', error);
    throw error;
  }
};

/**
 * 获取客户端连接（用于事务）
 */
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // 设置超时释放
  const timeout = setTimeout(() => {
    console.error('客户端连接超时，强制释放');
    client.release();
  }, 5000);

  // 包装 release 方法
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release();
  };

  return client;
};

/**
 * 关闭连接池
 */
export const closePool = async () => {
  await pool.end();
  console.log('🔌 数据库连接池已关闭');
};

export default pool;

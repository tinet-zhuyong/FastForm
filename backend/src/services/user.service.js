import { query } from '../config/database.js';
import crypto from 'crypto';

/**
 * 密码加密
 */
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * 用户登录
 */
export const login = async (username, password) => {
  const hashedPassword = hashPassword(password);
  
  const result = await query(
    'SELECT "userId", "username", "email", "role", "createdAt" FROM "users" WHERE "username" = $1 AND "password" = $2',
    [username, hashedPassword]
  );
  
  if (result.rows.length === 0) {
    throw new Error('用户名或密码错误');
  }

  const user = result.rows[0];

  // 返回用户信息（实际应用中应该返回 JWT token）
  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
    role: user.role,
    token: 'mock_token_' + user.userId
  };
};

/**
 * 用户注册
 */
export const register = async (userData) => {
  const { username, password, email, role = 'normal' } = userData;

  // 检查用户名是否已存在
  const existingUser = await query(
    'SELECT "userId" FROM "users" WHERE "username" = $1',
    [username]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('用户名已存在');
  }

  // 检查邮箱是否已存在
  if (email) {
    const existingEmail = await query(
      'SELECT "userId" FROM "users" WHERE "email" = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      throw new Error('邮箱已被使用');
    }
  }

  const hashedPassword = hashPassword(password);

  const result = await query(
    'INSERT INTO "users" ("username", "password", "email", "role") VALUES ($1, $2, $3, $4) RETURNING "userId", "username", "email", "role", "createdAt"',
    [username, hashedPassword, email, role]
  );

  const newUser = result.rows[0];

  return {
    userId: newUser.userId,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    token: 'mock_token_' + newUser.userId
  };
};

/**
 * 获取用户信息
 */
export const getProfile = async (userId) => {
  const result = await query(
    'SELECT "userId", "username", "email", "role", "createdAt", "updatedAt" FROM "users" WHERE "userId" = $1',
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('用户不存在');
  }

  return result.rows[0];
};

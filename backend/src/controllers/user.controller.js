import * as userService from '../services/user.service.js';

/**
 * 用户登录
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await userService.login(username, password);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户注册
 */
export const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const result = await userService.register(userData);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户信息
 */
export const getProfile = async (req, res, next) => {
  try {
    // 这里需要从 token 中获取用户 ID
    const userId = req.user?.userId || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: '未授权访问' }
      });
    }
    
    const profile = await userService.getProfile(userId);
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

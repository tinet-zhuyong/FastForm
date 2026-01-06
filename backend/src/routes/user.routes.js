import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// 用户相关路由
router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/profile', userController.getProfile);

export default router;

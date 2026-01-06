import express from 'express';
import surveyRoutes from './survey.routes.js';
import userRoutes from './user.routes.js';
import submissionRoutes from './submission.routes.js';

const router = express.Router();

// 路由模块
router.use('/surveys', surveyRoutes);
router.use('/users', userRoutes);
router.use('/submissions', submissionRoutes);

// 根路由
router.get('/', (req, res) => {
  res.json({
    message: 'FastForm API',
    version: '1.0.0',
    endpoints: {
      surveys: '/api/surveys',
      users: '/api/users',
      submissions: '/api/submissions'
    }
  });
});

export default router;

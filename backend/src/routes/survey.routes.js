import express from 'express';
import * as surveyController from '../controllers/survey.controller.js';

const router = express.Router();

// 问卷相关路由
router.get('/', surveyController.getAllSurveys);
router.get('/:id', surveyController.getSurveyById);
router.get('/url/:url', surveyController.getSurveyByUrl); // 通过 URL 获取表单
router.post('/', surveyController.createSurvey);
router.put('/:id', surveyController.updateSurvey);
router.delete('/:id', surveyController.deleteSurvey);

// 问卷统计
router.get('/:id/analytics', surveyController.getSurveyAnalytics);

// 星标功能
router.put('/:id/star', surveyController.toggleStarSurvey);

// 回收站功能
router.put('/:id/restore', surveyController.restoreSurvey);
router.delete('/:id/permanent', surveyController.permanentDeleteSurvey);

export default router;

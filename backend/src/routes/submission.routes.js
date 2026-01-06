import express from 'express';
import * as submissionController from '../controllers/submission.controller.js';

const router = express.Router();

// 提交表单
router.post('/', submissionController.submitForm);

// 获取表单的提交记录
router.get('/form/:formId', submissionController.getFormSubmissions);

// 获取表单提交统计
router.get('/form/:formId/stats', submissionController.getFormSubmissionStats);

export default router;

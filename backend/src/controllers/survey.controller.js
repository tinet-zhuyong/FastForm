import * as surveyService from '../services/survey.service.js';

/**
 * 获取所有问卷
 */
export const getAllSurveys = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const type = req.query.type || 'all'; // 'all', 'starred', 'trash'
    const surveys = await surveyService.getAllSurveys(userId, type);
    res.json({
      success: true,
      data: surveys
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 根据 ID 获取问卷
 */
export const getSurveyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const survey = await surveyService.getSurveyById(id);
    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 根据 URL 获取问卷（公开访问）
 */
export const getSurveyByUrl = async (req, res, next) => {
  try {
    const { url } = req.params;
    const survey = await surveyService.getSurveyByUrl(url);
    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建问卷
 */
export const createSurvey = async (req, res, next) => {
  try {
    const surveyData = req.body;
    const newSurvey = await surveyService.createSurvey(surveyData);
    res.status(201).json({
      success: true,
      data: newSurvey
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新问卷
 */
export const updateSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const surveyData = req.body;
    const updatedSurvey = await surveyService.updateSurvey(id, surveyData);
    res.json({
      success: true,
      data: updatedSurvey
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除问卷
 */
export const deleteSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    await surveyService.deleteSurvey(id);
    res.json({
      success: true,
      message: '问卷删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取问卷统计数据
 */
export const getSurveyAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analytics = await surveyService.getSurveyAnalytics(id);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 切换问卷星标状态
 */
export const toggleStarSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedSurvey = await surveyService.toggleStarSurvey(id);
    res.json({
      success: true,
      data: updatedSurvey,
      message: updatedSurvey.isStarred ? '已添加星标' : '已取消星标'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 永久删除问卷（从回收站删除）
 */
export const permanentDeleteSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    await surveyService.permanentDeleteSurvey(id);
    res.json({
      success: true,
      message: '问卷已永久删除'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 从回收站恢复问卷
 */
export const restoreSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    await surveyService.restoreSurvey(id);
    res.json({
      success: true,
      message: '问卷已恢复'
    });
  } catch (error) {
    next(error);
  }
};

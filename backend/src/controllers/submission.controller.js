import * as submissionService from '../services/submission.service.js';

/**
 * 提交表单
 */
export const submitForm = async (req, res, next) => {
  try {
    const submissionData = req.body;
    const newSubmission = await submissionService.createSubmission(submissionData);
    res.status(201).json({
      success: true,
      data: newSubmission,
      message: '提交成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取表单的所有提交记录
 */
export const getFormSubmissions = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const { startDate, endDate, page, limit } = req.query;

    const result = await submissionService.getSubmissionsByFormId(formId, {
      startDate,
      endDate,
      page,
      limit
    });

    res.json({
      success: true,
      data: result.submissions,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取表单提交统计
 */
export const getFormSubmissionStats = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const { startDate, endDate } = req.query;

    const stats = await submissionService.getSubmissionStats(formId, {
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

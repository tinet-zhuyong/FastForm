import { query } from '../config/database.js';

/**
 * 创建表单提交记录
 */
export const createSubmission = async (submissionData) => {
  const {
    formId,
    responseData,
    submitToken,
    ipAddress,
    userAgent
  } = submissionData;

  // 检查表单是否存在且已发布
  const formCheck = await query(
    'SELECT "formId", "status" FROM "forms" WHERE "formId" = $1',
    [formId]
  );

  if (formCheck.rows.length === 0) {
    throw new Error('表单不存在');
  }

  if (formCheck.rows[0].status !== 'active') {
    throw new Error('表单未发布或已停用');
  }

  // 如果有 submitToken，检查是否重复提交
  if (submitToken) {
    const duplicateCheck = await query(
      'SELECT "submissionId" FROM "submissions" WHERE "submitToken" = $1',
      [submitToken]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error('请勿重复提交');
    }
  }

  // 插入提交记录
  const result = await query(
    `INSERT INTO "submissions" 
    ("formId", "responseData", "submitToken", "ipAddress", "userAgent") 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [formId, responseData, submitToken, ipAddress, userAgent]
  );

  return result.rows[0];
};

/**
 * 获取表单的所有提交记录
 */
export const getSubmissionsByFormId = async (formId, filters = {}) => {
  const { startDate, endDate, page = 1, limit = 20 } = filters;
  
  let sql = 'SELECT * FROM "submissions" WHERE "formId" = $1';
  const params = [formId];
  let paramIndex = 2;

  // 时间范围筛选
  if (startDate) {
    sql += ` AND "submittedAt" >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    sql += ` AND "submittedAt" <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  // 排序
  sql += ' ORDER BY "submittedAt" DESC';

  // 分页
  const offset = (page - 1) * limit;
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);

  // 获取总数
  let countSql = 'SELECT COUNT(*) as total FROM "submissions" WHERE "formId" = $1';
  const countParams = [formId];
  let countParamIndex = 2;

  if (startDate) {
    countSql += ` AND "submittedAt" >= $${countParamIndex}`;
    countParams.push(startDate);
    countParamIndex++;
  }

  if (endDate) {
    countSql += ` AND "submittedAt" <= $${countParamIndex}`;
    countParams.push(endDate);
  }

  const countResult = await query(countSql, countParams);
  const total = parseInt(countResult.rows[0].total);

  return {
    submissions: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * 获取表单提交统计
 */
export const getSubmissionStats = async (formId, filters = {}) => {
  const { startDate, endDate } = filters;

  let sql = 'SELECT COUNT(*) as total, MIN("submittedAt") as earliest, MAX("submittedAt") as latest FROM "submissions" WHERE "formId" = $1';
  const params = [formId];
  let paramIndex = 2;

  if (startDate) {
    sql += ` AND "submittedAt" >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    sql += ` AND "submittedAt" <= $${paramIndex}`;
    params.push(endDate);
  }

  const result = await query(sql, params);
  
  return {
    total: parseInt(result.rows[0].total),
    earliest: result.rows[0].earliest,
    latest: result.rows[0].latest
  };
};

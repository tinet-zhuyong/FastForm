import { query } from '../config/database.js';

/**
 * 获取所有表单（根据用户ID和类型）
 * @param {string} userId - 用户ID
 * @param {string} type - 表单类型: 'all'(全部), 'starred'(星标), 'trash'(回收站)
 */
export const getAllSurveys = async (userId, type = 'all') => {
  let sql = `
    SELECT f.*, 
           COUNT(s."submissionId") as "responseCount"
    FROM "forms" f
    LEFT JOIN "submissions" s ON f."formId" = s."formId"
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  // 根据类型筛选
  if (type === 'trash') {
    // 回收站：显示已删除的表单
    sql += ` AND f."deletedAt" IS NOT NULL`;
  } else {
    // 非回收站：不显示已删除的表单
    sql += ` AND f."deletedAt" IS NULL`;
    
    if (type === 'starred') {
      // 星标问卷
      sql += ` AND f."isStarred" = true`;
    }
  }
  
  if (userId) {
    sql += ` AND f."createUserId" = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }
  
  sql += ` GROUP BY f."formId" ORDER BY f."createdAt" DESC`;
  
  const result = await query(sql, params);
  return result.rows;
};

/**
 * 根据 ID 获取表单
 */
export const getSurveyById = async (id) => {
  const result = await query(
    'SELECT * FROM "forms" WHERE "formId" = $1 AND "deletedAt" IS NULL',
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('表单不存在');
  }
  
  return result.rows[0];
};

/**
 * 根据 URL 获取表单（公开访问）
 */
export const getSurveyByUrl = async (url) => {
  const result = await query(
    'SELECT * FROM "forms" WHERE "url" = $1 AND "deletedAt" IS NULL',
    [url]
  );
  
  if (result.rows.length === 0) {
    throw new Error('表单不存在');
  }
  
  return result.rows[0];
};

/**
 * 创建表单
 */
export const createSurvey = async (surveyData) => {
  const { 
    title, 
    description, 
    jsonSchema, 
    createType = 'blank', 
    templateId, 
    url, 
    createUserId 
  } = surveyData;

  // 检查标题是否已存在
  const existingTitle = await query(
    'SELECT "formId" FROM "forms" WHERE "title" = $1',
    [title]
  );

  if (existingTitle.rows.length > 0) {
    throw new Error('表单标题已存在');
  }

  // 检查 URL 是否已存在
  const existingUrl = await query(
    'SELECT "formId" FROM "forms" WHERE "url" = $1',
    [url]
  );

  if (existingUrl.rows.length > 0) {
    throw new Error('表单 URL 已存在');
  }

  const result = await query(
    `INSERT INTO "forms" 
    ("title", "description", "jsonSchema", "createType", "templateId", "url", "createUserId") 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *`,
    [title, description, jsonSchema, createType, templateId, url, createUserId]
  );

  return result.rows[0];
};

/**
 * 更新表单
 */
export const updateSurvey = async (id, surveyData) => {
  const { title, description, jsonSchema, status } = surveyData;
  
  // 检查表单是否存在
  await getSurveyById(id);
  
  const result = await query(
    `UPDATE "forms" 
    SET "title" = COALESCE($1, "title"),
        "description" = COALESCE($2, "description"),
        "jsonSchema" = COALESCE($3, "jsonSchema"),
        "status" = COALESCE($4, "status"),
        "publishTime" = CASE WHEN $4 = 'active' AND "publishTime" IS NULL THEN CURRENT_TIMESTAMP ELSE "publishTime" END
    WHERE "formId" = $5
    RETURNING *`,
    [title, description, jsonSchema, status, id]
  );

  return result.rows[0];
};

/**
 * 删除表单（软删除 - 移入回收站）
 */
export const deleteSurvey = async (id) => {
  // 检查表单是否存在
  await getSurveyById(id);
  
  await query(
    'UPDATE "forms" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "formId" = $1',
    [id]
  );
};

/**
 * 永久删除表单（从回收站删除）
 */
export const permanentDeleteSurvey = async (id) => {
  // 检查表单是否在回收站
  const result = await query(
    'SELECT * FROM "forms" WHERE "formId" = $1 AND "deletedAt" IS NOT NULL',
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('表单不在回收站中');
  }
  
  await query('DELETE FROM "forms" WHERE "formId" = $1', [id]);
};

/**
 * 从回收站恢复表单
 */
export const restoreSurvey = async (id) => {
  // 检查表单是否在回收站
  const result = await query(
    'SELECT * FROM "forms" WHERE "formId" = $1 AND "deletedAt" IS NOT NULL',
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('表单不在回收站中');
  }
  
  await query(
    'UPDATE "forms" SET "deletedAt" = NULL WHERE "formId" = $1',
    [id]
  );
};

/**
 * 切换表单星标状态
 */
export const toggleStarSurvey = async (id) => {
  // 检查表单是否存在
  await getSurveyById(id);
  
  const result = await query(
    'UPDATE "forms" SET "isStarred" = NOT "isStarred" WHERE "formId" = $1 RETURNING *',
    [id]
  );
  
  return result.rows[0];
};

/**
 * 获取表单统计数据
 */
export const getSurveyAnalytics = async (id) => {
  // 检查表单是否存在
  const form = await getSurveyById(id);
  
  // 获取提交总数
  const submissionCount = await query(
    'SELECT COUNT(*) as total FROM "submissions" WHERE "formId" = $1',
    [id]
  );
  
  // 获取最近提交时间
  const latestSubmission = await query(
    'SELECT "submittedAt" FROM "submissions" WHERE "formId" = $1 ORDER BY "submittedAt" DESC LIMIT 1',
    [id]
  );
  
  return {
    formId: form.formId,
    title: form.title,
    status: form.status,
    totalResponses: parseInt(submissionCount.rows[0].total),
    createdAt: form.createdAt,
    publishTime: form.publishTime,
    latestSubmission: latestSubmission.rows[0]?.submittedAt || null
  };
};

/**
 * 表单数据校验工具
 */

/**
 * 校验问卷 JSON Schema
 * @param {Object} jsonSchema - 问卷的 JSON 数据
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateFormSchema = (jsonSchema) => {
  const errors = [];

  // 检查是否为对象
  if (!jsonSchema || typeof jsonSchema !== 'object') {
    return {
      valid: false,
      errors: ['JSON 数据格式错误，必须是一个对象']
    };
  }

  // 遍历每个问卷（支持多个问卷的情况）
  const surveys = Object.values(jsonSchema);
  
  if (surveys.length === 0) {
    return {
      valid: false,
      errors: ['JSON 数据不能为空']
    };
  }

  // 用于检查问题 ID 是否重复
  const allQuestionIds = [];

  surveys.forEach((survey, surveyIndex) => {
    const surveyName = Object.keys(jsonSchema)[surveyIndex];

    // 1. 校验问卷必须有 title
    if (!survey.title || typeof survey.title !== 'string' || survey.title.trim() === '') {
      errors.push(`问卷 "${surveyName}" 缺少必填字段 "title" 或 title 为空`);
    }

    // 2. 校验问卷必须有 questions 数组
    if (!survey.questions) {
      errors.push(`问卷 "${surveyName}" 缺少必填字段 "questions"`);
      return; // 如果没有 questions，后续校验无法进行
    }

    if (!Array.isArray(survey.questions)) {
      errors.push(`问卷 "${surveyName}" 的 "questions" 必须是数组`);
      return;
    }

    if (survey.questions.length === 0) {
      errors.push(`问卷 "${surveyName}" 的 "questions" 不能为空，至少需要一个问题`);
      return;
    }

    // 3. 校验每个问题
    survey.questions.forEach((question, questionIndex) => {
      const questionPrefix = `问卷 "${surveyName}" 的第 ${questionIndex + 1} 个问题`;

      // 3.1 校验问题必须有 id
      if (!question.id) {
        errors.push(`${questionPrefix} 缺少必填字段 "id"`);
      } else {
        // 检查问题 ID 是否重复
        if (allQuestionIds.includes(question.id)) {
          errors.push(`${questionPrefix} 的 id "${question.id}" 与其他问题重复，每个问题的 id 必须唯一`);
        } else {
          allQuestionIds.push(question.id);
        }
      }

      // 3.2 校验问题必须有 question 文本
      if (!question.question || typeof question.question !== 'string' || question.question.trim() === '') {
        errors.push(`${questionPrefix} 缺少必填字段 "question" 或 question 为空`);
      }

      // 3.3 校验问题必须有选项（options、multioptions 或 select）
      const hasOptions = question.options && Array.isArray(question.options) && question.options.length > 0;
      const hasMultiOptions = question.multioptions && Array.isArray(question.multioptions) && question.multioptions.length > 0;
      const hasSelect = question.select && Array.isArray(question.select) && question.select.length > 0;

      if (!hasOptions && !hasMultiOptions && !hasSelect) {
        errors.push(`${questionPrefix} 必须包含 "options"、"multioptions" 或 "select" 且不能为空`);
      }

      // 3.4 校验 options 的结构
      if (hasOptions) {
        const optionIds = [];
        question.options.forEach((option, optionIndex) => {
          if (!option.id) {
            errors.push(`${questionPrefix} 的第 ${optionIndex + 1} 个选项缺少 "id"`);
          } else {
            // 检查选项 ID 是否重复
            if (optionIds.includes(option.id)) {
              errors.push(`${questionPrefix} 的选项 id "${option.id}" 重复，同一问题的选项 id 必须唯一`);
            } else {
              optionIds.push(option.id);
            }
          }
          if (!option.text || typeof option.text !== 'string' || option.text.trim() === '') {
            errors.push(`${questionPrefix} 的第 ${optionIndex + 1} 个选项缺少 "text" 或 text 为空`);
          }
        });
      }

      // 3.5 校验 multioptions 的结构
      if (hasMultiOptions) {
        const multiOptionIds = [];
        question.multioptions.forEach((option, optionIndex) => {
          if (!option.id) {
            errors.push(`${questionPrefix} 的第 ${optionIndex + 1} 个多选项缺少 "id"`);
          } else {
            // 检查多选项 ID 是否重复
            if (multiOptionIds.includes(option.id)) {
              errors.push(`${questionPrefix} 的多选项 id "${option.id}" 重复，同一问题的选项 id 必须唯一`);
            } else {
              multiOptionIds.push(option.id);
            }
          }
          if (!option.text || typeof option.text !== 'string' || option.text.trim() === '') {
            errors.push(`${questionPrefix} 的第 ${optionIndex + 1} 个多选项缺少 "text" 或 text 为空`);
          }
        });
      }

      // 3.6 校验 select 的结构
      if (hasSelect) {
        const selectIds = [];
        question.select.forEach((option, optionIndex) => {
          if (!option.id) {
            errors.push(`${questionPrefix} 的第 ${optionIndex + 1} 个下拉选项缺少 "id"`);
          } else {
            // 检查下拉选项 ID 是否重复
            if (selectIds.includes(option.id)) {
              errors.push(`${questionPrefix} 的下拉选项 id "${option.id}" 重复，同一问题的选项 id 必须唯一`);
            } else {
              selectIds.push(option.id);
            }
          }
          if (!option.text || typeof option.text !== 'string' || option.text.trim() === '') {
            errors.push(`${questionPrefix} 的第 ${optionIndex + 1} 个下拉选项缺少 "text" 或 text 为空`);
          }
        });
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * 格式化校验错误信息
 * @param {string[]} errors - 错误信息数组
 * @returns {string} 格式化后的错误信息
 */
export const formatValidationErrors = (errors) => {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0];
  }

  return `发现 ${errors.length} 个错误：\n${errors.map((err, index) => `${index + 1}. ${err}`).join('\n')}`;
};

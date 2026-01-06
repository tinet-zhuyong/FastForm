import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG, WEBAPI } from '../../config';
import './FormFill.css';

/**
 * 表单填写页面（公开访问）
 */
const FormFill = () => {
  const { url } = useParams(); // 从 URL 参数获取表单标识
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitToken, setSubmitToken] = useState(null);

  // 生成唯一的提交令牌（防重复提交）
  useEffect(() => {
    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    setSubmitToken(token);
  }, []);

  // 加载表单数据
  useEffect(() => {
    loadForm();
  }, [url]);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.get(WEBAPI.getFormByUrl(url), {
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        const formData = response.data.data;
        
        // 检查表单状态
        if (formData.status !== 'active') {
          setError('该表单未发布或已停用');
          return;
        }

        setForm(formData);
      } else {
        setError(response.data.error?.message || '表单不存在');
      }
    } catch (err) {
      setError(err.message || '加载表单失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理单选题答案
  const handleRadioChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  // 处理多选题答案
  const handleCheckboxChange = (questionId, optionId, checked) => {
    const currentAnswers = answers[questionId] || [];
    
    if (checked) {
      setAnswers({
        ...answers,
        [questionId]: [...currentAnswers, optionId],
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: currentAnswers.filter((id) => id !== optionId),
      });
    }
  };

  // 处理下拉选择框答案
  const handleSelectChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 防止重复提交：如果正在提交或已提交，直接返回
    if (isSubmitting || submitted) {
      return;
    }

    // 校验是否所有问题都已回答
    const jsonSchema = form.jsonSchema;
    const allQuestions = Object.values(jsonSchema).flatMap((survey) => survey.questions || []);
    
    const unansweredQuestions = allQuestions.filter((q) => !answers[q.id]);
    
    if (unansweredQuestions.length > 0) {
      alert(`请回答所有问题（还有 ${unansweredQuestions.length} 个问题未回答）`);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        WEBAPI.submitForm,
        {
          formId: form.formId,
          responseData: answers,
          submitToken: submitToken, // 使用唯一令牌防止重复提交
          ipAddress: 'unknown', // 实际应用中应从服务器获取
          userAgent: navigator.userAgent,
        },
        {
          timeout: API_CONFIG.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSubmitted(true);
      } else {
        alert(response.data.error?.message || '提交失败');
        setIsSubmitting(false); // 失败后允许重试
      }
    } catch (err) {
      alert(err.message || '提交失败');
      setIsSubmitting(false); // 失败后允许重试
    }
    // 注意：成功后不重置 isSubmitting，保持按钮禁用状态
  };

  if (isLoading) {
    return (
      <div className="form-fill-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>加载表单中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-fill-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>无法加载表单</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="form-fill-container">
        <div className="success-state">
          <div className="success-icon">✅</div>
          <h2>提交成功</h2>
          <p>感谢您的参与！</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  const jsonSchema = form.jsonSchema;
  const surveys = Object.values(jsonSchema);

  return (
    <div className="form-fill-container">
      <div className="form-fill-header">
        <div className="logo">📋</div>
        <h1>Fast Form</h1>
      </div>

      <div className="form-fill-content">
        <div className="form-info">
          <h2>{form.title}</h2>
          {form.description && <p className="form-description">{form.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="fill-form">
          {surveys.map((survey, surveyIndex) => (
            <div key={surveyIndex} className="survey-section">
              {survey.title && <h3 className="survey-title">{survey.title}</h3>}
              {survey.description && <p className="survey-description">{survey.description}</p>}

              {survey.questions && survey.questions.map((question, questionIndex) => (
                <div key={question.id} className="question-block">
                  <div className="question-header">
                    <span className="question-number">{questionIndex + 1}.</span>
                    <span className="question-text">{question.question}</span>
                    <span className="required-mark">*</span>
                  </div>

                  {/* 单选题 */}
                  {question.options && (
                    <div className="options-list">
                      {question.options.map((option) => (
                        <label key={option.id} className="option-item">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={answers[question.id] === option.id}
                            onChange={() => handleRadioChange(question.id, option.id)}
                            required
                          />
                          <span className="option-text">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* 多选题 */}
                  {question.multioptions && (
                    <div className="options-list">
                      {question.multioptions.map((option) => (
                        <label key={option.id} className="option-item">
                          <input
                            type="checkbox"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={(answers[question.id] || []).includes(option.id)}
                            onChange={(e) =>
                              handleCheckboxChange(question.id, option.id, e.target.checked)
                            }
                          />
                          <span className="option-text">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* 下拉选择框 */}
                  {question.select && Array.isArray(question.select) && (
                    <div className="select-wrapper">
                      <select
                        className="select-dropdown"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleSelectChange(question.id, e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          请选择...
                        </option>
                        {question.select.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isSubmitting || submitted}
            >
              {isSubmitting ? '提交中...' : submitted ? '已提交' : '提交'}
            </button>
          </div>
        </form>
      </div>

      <div className="form-fill-footer">
        <p>Powered by Fast Form</p>
      </div>
    </div>
  );
};

export default FormFill;

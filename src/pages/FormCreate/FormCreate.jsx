import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import returnIcon from '../../assets/return.svg';
import { API_CONFIG, WEBAPI } from '../../config';
import { getUserId } from '../../utils/auth';
import { validateFormSchema, formatValidationErrors } from '../../utils/formValidator';
import './FormCreate.css';

const FormCreate = () => {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('id'); // 获取编辑的表单 ID
  const isEditMode = !!formId;

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const navigate = useNavigate();

  // 加载已有表单数据（编辑模式）
  useEffect(() => {
    if (isEditMode) {
      loadFormData();
    }
  }, [formId]);

  const loadFormData = async () => {
    try {
      setIsLoadingForm(true);
      setError('');

      const response = await axios.get(WEBAPI.getFormById(formId), {
        timeout: API_CONFIG.timeout,
      });

      if (response.data.success) {
        const form = response.data.data;
        setFormTitle(form.title);
        setFormDescription(form.description || '');
        setFormData(form.jsonSchema);
        setJsonInput(JSON.stringify(form.jsonSchema, null, 2));
      } else {
        setError(response.data.error?.message || '加载表单失败');
      }
    } catch (err) {
      setError(err.message || '加载表单时发生错误');
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleJsonChange = (e) => {
    const input = e.target.value;
    setJsonInput(input);
    setError('');
    setValidationErrors([]);
    
    try {
      if (input.trim()) {
        const parsed = JSON.parse(input);
        setFormData(parsed);
        
        // 实时校验 JSON 数据
        const validation = validateFormSchema(parsed);
        if (!validation.valid) {
          setValidationErrors(validation.errors);
        }
      } else {
        setFormData(null);
        setValidationErrors([]);
      }
    } catch {
      setError('JSON 格式错误，请检查输入');
      setFormData(null);
      setValidationErrors([]);
    }
  };

  const generateFormUrl = (title) => {
    // 生成唯一的表单 URL
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `form-${timestamp}-${randomStr}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formTitle.trim()) {
      setError('请输入表单标题');
      return;
    }
    
    if (!formData) {
      setError('请输入有效的 JSON 数据');
      return;
    }

    // 提交前再次校验
    const validation = validateFormSchema(formData);
    if (!validation.valid) {
      setError(formatValidationErrors(validation.errors));
      setValidationErrors(validation.errors);
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // 获取当前用户 ID
      const userId = getUserId();
      
      if (!userId) {
        setError('用户未登录，请先登录');
        navigate('/');
        return;
      }
      
      if (isEditMode) {
        // 更新表单
        const formPayload = {
          title: formTitle,
          description: formDescription || '',
          jsonSchema: formData,
        };

        const response = await axios.put(
          WEBAPI.updateForm(formId),
          formPayload,
          {
            timeout: API_CONFIG.timeout,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          navigate('/space');
        } else {
          setError(response.data.error?.message || '更新表单失败');
        }
      } else {
        // 创建新表单
        const formPayload = {
          title: formTitle,
          description: formDescription || '',
          jsonSchema: formData,
          createType: 'json',
          url: generateFormUrl(formTitle),
          createUserId: userId,
        };

        const response = await axios.post(WEBAPI.createForm, formPayload, {
          timeout: API_CONFIG.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          navigate('/space');
        } else {
          setError(response.data.error?.message || '保存表单失败');
        }
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('请求超时，请稍后重试');
      } else if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError(err.message || '操作失败');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/space');
  };

  if (isLoadingForm) {
    return (
      <div className="form-create-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>加载表单数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-create-container">
      <header className="form-create-header">
        <button className="back-button" onClick={handleBack}>
          <img src={returnIcon} alt="返回" className="back-icon" />
        </button>
        <h3>{isEditMode ? '编辑表单' : '创建表单'}</h3>
      </header>
      <main className="form-create-main">
        <form onSubmit={handleSubmit} className="form-create-form">
          <div className="form-basic-info">
            <div className="form-group">
              <label htmlFor="form-title">表单标题 *</label>
              <input
                type="text"
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="请输入表单标题"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="form-description">表单描述</label>
              <input
                type="text"
                id="form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="请输入表单描述（可选）"
              />
            </div>
          </div>
          
          <div className="form-columns">
            <div className="form-section left-column">
              <h2>JSON 配置</h2>
              <div className="json-input-section">
                <textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={handleJsonChange}
                  placeholder="请输入或粘贴 JSON 格式的表单配置..."
                  rows={15}
                />
                {error && <div className="error-message">{error}</div>}
                {validationErrors.length > 0 && (
                  <div className="validation-errors">
                    <div className="validation-header">
                      ⚠️ 发现 {validationErrors.length} 个校验错误：
                    </div>
                    <ul className="validation-list">
                      {validationErrors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-section right-column">
              <h2>表单预览</h2>
              <div className="preview-section">
                {formData ? (
                  <div className="form-preview">
                    {Object.entries(formData).map(([key, form]) => (
                      <div key={key} className="preview-content">
                        <h3>{form.title}</h3>
                        <div>{form.description}</div>
                        {form.questions && (
                          <div className="preview-questions">
                            {form.questions.map((question, index) => (
                              <div key={question.id || index} className="question-item">
                                <p className="question-text">
                                  <strong>{index + 1}. {question.question}</strong>
                                </p>
                                {question.options && (
                                  <div className="question-options">
                                    {question.options.map((option, optIndex) => (
                                      <label key={option.id || optIndex} className="option-label">
                                        <input
                                          type="radio"
                                          name={`question-${question.id || index}`}
                                          className="option-radio"
                                        />
                                        <span className="option-text">
                                          {option.id}. {option.text}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                                {question.multioptions && (
                                  <div className="question-options">
                                    {question.multioptions.map((option, optIndex) => (
                                      <label key={option.id || optIndex} className="option-label">
                                        <input
                                          type="checkbox"
                                          name={`question-${question.id || index}`}
                                          className="option-checkbox"
                                        />
                                        <span className="option-text">
                                          {option.id}. {option.text}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                                {question.select && Array.isArray(question.select) && (
                                  <div className="question-select">
                                    <select 
                                      className="select-dropdown"
                                      defaultValue=""
                                    >
                                      <option value="" disabled>
                                        请选择...
                                      </option>
                                      {question.select.map((option, optIndex) => (
                                        <option 
                                          key={option.id || optIndex} 
                                          value={option.id}
                                        >
                                          {option.id}. {option.text}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-preview">
                    <p>请输入 JSON 数据以查看预览</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleBack}>
              取消
            </button>
            <button 
              type="submit" 
              className="create-button" 
              disabled={isLoading || validationErrors.length > 0}
            >
              {isLoading ? '保存中...' : isEditMode ? '保存修改' : '创建表单'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default FormCreate;
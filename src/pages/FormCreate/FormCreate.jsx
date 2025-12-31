import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import returnIcon from '../../assets/return.svg';
import './FormCreate.css';

const FormCreate = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJsonChange = (e) => {
    const input = e.target.value;
    setJsonInput(input);
    setError('');
    
    try {
      if (input.trim()) {
        const parsed = JSON.parse(input);
        setFormData(parsed);
      } else {
        setFormData(null);
      }
    } catch {
      setError('JSON 格式错误，请检查输入');
      setFormData(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData) {
      setError('请输入有效的 JSON 数据');
      return;
    }
    
    // 这里可以添加保存表单的逻辑
    console.log('Form created:', formData);
    
    // 提交后返回表单列表
    navigate('/space');
  };

  const handleBack = () => {
    navigate('/space');
  };

  return (
    <div className="form-create-container">
      <header className="form-create-header">
        <button className="back-button" onClick={handleBack}>
          <img src={returnIcon} alt="返回" className="back-icon" />
        </button>
        <h3>创建表单</h3>
      </header>
      <main className="form-create-main">
        <form onSubmit={handleSubmit} className="form-create-form">
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
            <button type="submit" className="create-button">
              创建表单
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default FormCreate;
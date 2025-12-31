import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormBuild.css';

const FormBuild = () => {
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit the new survey logic here
    console.log('Survey created:', { surveyTitle, surveyDescription });
    // 提交后返回表单列表
    navigate('/space');
  };

  const handleBack = () => {
    navigate('/space');
  };

  return (
    <div className="form-build-container">
      <header className="form-build-header">
        <button className="back-button" onClick={handleBack}>← 返回</button>
        <h1>创建新表单</h1>
      </header>
      <main className="form-build-main">
        <form onSubmit={handleSubmit} className="survey-form">
          <div className="form-group">
            <label htmlFor="survey-title">表单标题</label>
            <input
              type="text"
              id="survey-title"
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              required
              placeholder="请输入表单标题"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="survey-description">表单描述</label>
            <textarea
              id="survey-description"
              value={surveyDescription}
              onChange={(e) => setSurveyDescription(e.target.value)}
              required
              placeholder="请输入表单描述"
              rows="4"
            />
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

export default FormBuild;
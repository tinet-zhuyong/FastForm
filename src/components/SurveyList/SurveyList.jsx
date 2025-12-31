import React from 'react';
import SurveyCard from '../SurveyCard/SurveyCard';
import './SurveyList.css';

const SurveyList = ({ onNavigateToBuild }) => {
  // Sample survey data, can be replaced with API data later
  const surveys = [
    {
      id: 1,
      title: '满意度调查',
      description: '您的反馈对我们非常重要，请花1分钟填写此问卷。',
      responses: 0,
      views: 52,
      status: '收集中',
    },
    {
      id: 2,
      title: '咖啡口味调研',
      description: '我们想了解您的咖啡偏好，帮助提供更好的产品体验。',
      responses: 0,
      views: 0,
      status: '草稿',
    },
  ];

  return (
    <div className="survey-list-container">
      <div className="survey-list-header">
        <div>
          <h2>我的表单</h2>
          <p>管理您创建的所有表单</p>
        </div>
      </div>
      
      <div className="survey-list">
        <div className="create-survey-card" onClick={onNavigateToBuild}>
          <div className="create-survey-icon">+</div>
          <div className="create-survey-title">AI 新建表单</div>
        </div>
        
        {surveys.map((survey) => (
          <SurveyCard
            key={survey.id}
            survey={survey}
          />
        ))}
      </div>
    </div>
  );
};

export default SurveyList;
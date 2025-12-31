import React from 'react';
import playIcon from '../../assets/play.svg';
import analyticsIcon from '../../assets/stat.svg';
import './SurveyCard.css';

const SurveyCard = ({ survey }) => {
  return (
    <div className="survey-card">
      <div className="survey-card-header">
        <span className={`status-badge ${survey.status === '收集中' ? 'active' : 'draft'}`}>
          {survey.status}
        </span>
      </div>
      
      <div className="survey-card-content">
        <h3 className="survey-card-title">{survey.title}</h3>
        <p className="survey-card-description">{survey.description}</p>
        
        <div className="survey-card-stats">
          <div className="stat-item">
            <span className="stat-label">RESPONSES</span>
            <span className="stat-value">{survey.responses}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">VIEWS</span>
            <span className="stat-value">{survey.views}</span>
          </div>
        </div>
      </div>
      
      <div className="survey-card-actions">
        <button className="action-button view-button">
          <img src={playIcon} alt="View" className="action-icon" />
        </button>
        <button className="action-button analytics-button">
          <img src={analyticsIcon} alt="Analytics" className="action-icon" />
        </button>
      </div>
    </div>
  );
};

export default SurveyCard;
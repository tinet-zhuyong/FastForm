import React from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyList from '../../components/SurveyList/SurveyList';
import './Space.css';

const Space = () => {
  const navigate = useNavigate();

  return (
    <div className="space-container">
      <header className="space-header">
        <h1>Fast Form</h1>
      </header>
      <main className="space-main">
        <SurveyList onNavigateToBuild={() => navigate('/form/create')} />
      </main>
    </div>
  );
};

export default Space;
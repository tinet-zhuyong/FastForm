import React from 'react';
import './SurveyAnalytics.css';

function SurveyAnalytics({ responses }) {
  return (
    <div className="survey-analytics">
      <h2>Survey Analytics</h2>
      {responses && responses.length > 0 ? (
        <div>
          <h3>Responses ({responses.length})</h3>
          <ul>
            {responses.map((response, index) => (
              <li key={index}>
                <div><strong>Response {index + 1}:</strong></div>
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No responses yet.</p>
      )}
    </div>
  );
}

export default SurveyAnalytics;
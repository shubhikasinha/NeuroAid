import React from 'react';
import { generateSessionInsights, generateRecommendations } from '../../utils/analyticsUtils';

const SessionInsights = ({ sessionData }) => {
  if (!sessionData?.length) return null;

  const insights = generateSessionInsights(sessionData);
  const recommendations = generateRecommendations(sessionData);

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: '#333', marginBottom: '20px' }}>Session Insights</h3>

      {/* Insights */}
      <div style={{ marginBottom: '30px' }}>
        {insights.map((insight, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '12px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <span role="img" aria-label="insight" style={{ fontSize: '20px' }}>
                {insight.emoji}
              </span>
              <h4 style={{
                margin: 0,
                color: '#2196f3',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                {insight.title}
              </h4>
            </div>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 style={{
            color: '#333',
            marginBottom: '15px',
            fontSize: '16px'
          }}>
            Recommendations
          </h4>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none'
          }}>
            {recommendations.map((recommendation, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '12px'
                }}
              >
                <span role="img" aria-label="recommendation" style={{
                  color: '#4caf50',
                  fontSize: '16px'
                }}>
                  ✦
                </span>
                <span style={{
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {recommendation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SessionInsights; 
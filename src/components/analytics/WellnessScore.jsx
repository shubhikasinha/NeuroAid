import React from 'react';
import { calculateWellnessScore } from '../../utils/analyticsUtils';

const WellnessScore = ({ sessionData }) => {
  if (!sessionData?.length) return null;

  const score = calculateWellnessScore(sessionData);
  const normalizedScore = (score + 1) / 2; // Convert from -1...1 to 0...1
  const percentage = Math.round(normalizedScore * 100);

  // Determine status and color based on score
  const getStatus = (score) => {
    if (score >= 0.7) return { label: 'Positive', color: '#4caf50', emoji: '🟢' };
    if (score >= 0.4) return { label: 'Balanced', color: '#ff9800', emoji: '🟡' };
    return { label: 'Distressed', color: '#f44336', emoji: '🔴' };
  };

  const status = getStatus(normalizedScore);

  // Generate feedback based on score
  const getFeedback = (score) => {
    if (score >= 0.7) {
      return 'Your emotional state is very positive. Keep maintaining these healthy patterns!';
    }
    if (score >= 0.4) {
      return 'You\'re maintaining a balanced emotional state. Consider activities that bring more joy.';
    }
    return 'You might be experiencing some emotional challenges. Consider reaching out for support.';
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ 
        color: '#333',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        Emotional Wellness
        <span role="img" aria-label={status.label}>{status.emoji}</span>
      </h3>

      {/* Progress bar */}
      <div style={{
        position: 'relative',
        height: '8px',
        backgroundColor: '#eee',
        borderRadius: '4px',
        marginBottom: '15px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: status.color,
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Score and status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: status.color
        }}>
          {percentage}%
        </div>
        <div style={{
          padding: '4px 12px',
          backgroundColor: `${status.color}15`,
          color: status.color,
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {status.label}
        </div>
      </div>

      {/* Feedback */}
      <p style={{
        margin: 0,
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        {getFeedback(normalizedScore)}
      </p>
    </div>
  );
};

export default WellnessScore; 
import React from 'react';
import EmotionTrendsChart from './EmotionTrendsChart';
import WellnessScore from './WellnessScore';
import SessionInsights from './SessionInsights';
import EmotionTimeline from './EmotionTimeline';

const SessionAnalytics = ({ sessionData }) => {
  if (!sessionData?.length) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        No session data available. Start a session to see analytics.
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        color: '#1a73e8',
        marginBottom: '24px',
        fontSize: '24px',
        fontWeight: 'normal'
      }}>
        Session Analytics
      </h2>

      <div style={{
        display: 'grid',
        gap: '24px',
        gridTemplateColumns: '1fr',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Emotion Trends Chart */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <EmotionTrendsChart sessionData={sessionData} />
        </div>

        {/* Wellness Score */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <WellnessScore sessionData={sessionData} />
        </div>

        {/* Session Insights */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <SessionInsights sessionData={sessionData} />
        </div>

        {/* Emotion Timeline */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <EmotionTimeline sessionData={sessionData} />
        </div>
      </div>
    </div>
  );
};

export default SessionAnalytics; 
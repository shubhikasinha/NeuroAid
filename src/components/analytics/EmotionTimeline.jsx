import React from 'react';
import { getDominantEmotion, calculateIntensity } from '../../utils/analyticsUtils';

const EmotionTimeline = ({ sessionData }) => {
  if (!sessionData?.length) return null;

  // Process events to include dominant emotion and intensity
  const events = sessionData.map(entry => {
    const dominantEmotion = getDominantEmotion(entry.emotions);
    const intensity = calculateIntensity(entry.emotions);
    const timestamp = new Date(entry.timestamp);

    return {
      ...entry,
      dominantEmotion,
      intensity,
      formattedTime: timestamp.toLocaleTimeString([], {
        minute: '2-digit',
        second: '2-digit'
      })
    };
  });

  // Get emotion color mapping
  const emotionColors = {
    happy: '#4caf50',
    sad: '#2196f3',
    angry: '#f44336',
    fearful: '#ff9800',
    disgusted: '#9c27b0',
    surprised: '#00bcd4',
    neutral: '#607d8b'
  };

  // Get intensity label
  const getIntensityLabel = (intensity) => {
    if (intensity >= 0.7) return 'High';
    if (intensity >= 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: '#333', marginBottom: '20px' }}>Emotion Timeline</h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {events.map((event, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              position: 'relative'
            }}
          >
            {/* Timeline connector */}
            {index < events.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '31px',
                top: '40px',
                bottom: '-12px',
                width: '2px',
                backgroundColor: '#e0e0e0'
              }} />
            )}

            {/* Timestamp */}
            <div style={{
              minWidth: '50px',
              fontSize: '14px',
              color: '#666',
              marginTop: '2px'
            }}>
              {event.formattedTime}
            </div>

            {/* Event marker */}
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: emotionColors[event.dominantEmotion],
              border: '2px solid #fff',
              boxShadow: '0 0 0 2px ' + emotionColors[event.dominantEmotion] + '40',
              zIndex: 1
            }} />

            {/* Event details */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{
                  color: emotionColors[event.dominantEmotion],
                  fontWeight: '500',
                  fontSize: '15px',
                  textTransform: 'capitalize'
                }}>
                  {event.dominantEmotion}
                </span>
                <span style={{
                  fontSize: '13px',
                  color: '#666',
                  backgroundColor: '#fff',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {getIntensityLabel(event.intensity)}
                </span>
                {event.isCrying && (
                  <span style={{
                    fontSize: '13px',
                    color: '#e91e63',
                    backgroundColor: '#e91e6315',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    Crying Detected
                  </span>
                )}
              </div>

              {/* Emotion bars */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '8px',
                marginTop: '8px'
              }}>
                {Object.entries(event.emotions)
                  .filter(([_, value]) => value > 0.1)
                  .sort(([_, a], [__, b]) => b - a)
                  .map(([emotion, value]) => (
                    <div key={emotion} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '4px',
                        backgroundColor: '#eee',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${value * 100}%`,
                          height: '100%',
                          backgroundColor: emotionColors[emotion],
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{
                        fontSize: '12px',
                        color: '#666',
                        minWidth: '32px'
                      }}>
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionTimeline; 
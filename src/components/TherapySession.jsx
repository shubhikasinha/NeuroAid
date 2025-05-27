import React, { useState, useRef } from 'react';
import WebcamEmotion from './WebcamEmotion';
import EmotionTrendsChart from './analytics/EmotionTrendsChart';
import WellnessScore from './analytics/WellnessScore';
import SessionInsights from './analytics/SessionInsights';
import EmotionTimeline from './analytics/EmotionTimeline';
import SessionAnalytics from './analytics/SessionAnalytics';
import { saveSession } from '../utils/emotionUtils';
import SessionSummaryPage from './SessionSummaryPage';

const TherapySession = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionData, setSessionData] = useState({
    startTime: null,
    duration: 0,
    emotions: []
  });
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const sessionStartTime = useRef(null);
  const [showSummary, setShowSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleEmotionDetected = (emotions) => {
    if (!isRecording) return;

    setSessionData(prev => ({
      ...prev,
      emotions: [...prev.emotions, emotions]
    }));
  };

  const toggleSession = () => {
    if (!isRecording) {
      // Starting new session
      setSessionData({
        startTime: Date.now(),
        duration: 0,
        emotions: []
      });
      setShowSummary(false);
    } else {
      // Ending session
      setSessionData(prev => ({
        ...prev,
        duration: Date.now() - prev.startTime
      }));
      setShowSummary(true);
    }
    setIsRecording(prev => !prev);
  };

  const toggleMic = () => {
    setIsMicActive(prev => !prev);
  };

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setSessionData({
      startTime: null,
      duration: 0,
      emotions: []
    }); // Clear emotions for next session
    setSaveStatus(null);
  };

  if (showSummary) {
    return <SessionSummaryPage sessionData={sessionData} />;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f0f2f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{ color: '#1a73e8', margin: 0, fontSize: '1.5rem' }}>NeuroAid+ Therapy Session</h2>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          {saveStatus && (
            <span style={{
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: saveStatus.includes('Failed') ? '#dc3545' : '#4caf50',
              color: 'white',
              fontSize: '14px'
            }}>
              {saveStatus}
            </span>
          )}
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: isRecording ? '#4caf50' : '#666',
            color: 'white',
            fontSize: '14px'
          }}>
            {isRecording ? 'Session Active' : 'Session Inactive'}
          </span>
          <button
            onClick={toggleSession}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: isRecording ? '#dc3545' : '#4caf50',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isRecording ? 'End Session' : 'Start Session'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        gap: '16px',
        flex: 1,
        minHeight: 0
      }}>
        {/* Video Area */}
        <div style={{
          flex: '1',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <div style={{
            position: 'relative',
            flex: 1,
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <WebcamEmotion
              onEmotionDetected={handleEmotionDetected}
              isRecording={isRecording}
              isCameraActive={isCameraActive}
            />
            {!isCameraActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>
                Camera is turned off
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px'
          }}>
            <button
              onClick={toggleMic}
              style={{
                padding: '10px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isMicActive ? '#1a73e8' : '#dc3545',
                color: 'white',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isMicActive ? '🎤' : '🚫'}
            </button>
            <button
              onClick={toggleCamera}
              style={{
                padding: '10px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isCameraActive ? '#1a73e8' : '#dc3545',
                color: 'white',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isCameraActive ? '📹' : '🚫'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          width: '280px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <h3 style={{ margin: 0, marginBottom: '12px', color: '#1a73e8', fontSize: '1.2rem' }}>Session Info</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isCameraActive ? '#4caf50' : '#dc3545'
              }}></span>
              <span>Camera {isCameraActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isMicActive ? '#4caf50' : '#dc3545'
              }}></span>
              <span>Microphone {isMicActive ? 'Active' : 'Inactive'}</span>
            </div>
            {isRecording && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ margin: 0, marginBottom: '8px', color: '#666' }}>Current Session</h4>
                <p style={{ margin: 0, marginBottom: '4px' }}>Emotions Tracked: {sessionData.emotions.length}</p>
                <p style={{ margin: 0 }}>Crying Episodes: {sessionData.emotions.filter(e => e.isCrying).length}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && (
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          marginTop: '20px'
        }}>
          <EmotionTrendsChart sessionData={sessionData.emotions} />
          <WellnessScore sessionData={sessionData.emotions} />
          <SessionInsights sessionData={sessionData.emotions} />
          <EmotionTimeline sessionData={sessionData.emotions} />
        </div>
      )}
    </div>
  );
};

export default TherapySession; 
import * as faceapi from '@vladmandic/face-api';

/**
 * Detects emotions from a video element using face-api.js
 * @param {HTMLVideoElement} videoElement - The video element to analyze
 * @returns {Promise<Object>} Object containing detection results and status
 */
export const detectEmotion = async (videoElement) => {
  try {
    const detections = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detections) {
      return {
        status: 'no-face',
        data: null
      };
    }

    const emotions = detections.expressions;
    const dominantEmotion = Object.entries(emotions)
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    // Check for crying condition
    const isCrying = emotions.sad > 0.4 && (emotions.fearful > 0.2 || emotions.neutral < 0.1);

    return {
      status: 'detected',
      data: {
        timestamp: new Date().getTime(),
        emotion: isCrying ? 'Crying 😢' : `${dominantEmotion} ${getEmoji(dominantEmotion)}`,
        emotions: emotions,
        isCrying
      }
    };
  } catch (error) {
    console.error('Error in emotion detection:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Gets emoji for a given emotion
 * @param {string} emotion - The emotion to get emoji for
 * @returns {string} The corresponding emoji
 */
export const getEmoji = (emotion) => {
  const emojis = {
    neutral: '😐',
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😮'
  };
  return emojis[emotion] || '';
};

/**
 * Saves session data to localStorage
 * @param {Object} sessionData - The session data to save
 */
export const saveSession = (sessionData) => {
  try {
    // Get existing sessions
    const existingSessions = JSON.parse(localStorage.getItem('neuroaid_sessions') || '[]');
    
    // Add new session with metadata
    const sessionWithMetadata = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      duration: sessionData[sessionData.length - 1]?.timestamp - sessionData[0]?.timestamp,
      emotionCount: sessionData.length,
      cryingEpisodes: sessionData.filter(e => e.isCrying).length,
      data: sessionData
    };

    // Add to existing sessions and save
    existingSessions.push(sessionWithMetadata);
    localStorage.setItem('neuroaid_sessions', JSON.stringify(existingSessions));

    return true;
  } catch (error) {
    console.error('Error saving session:', error);
    return false;
  }
};

/**
 * Gets all saved sessions from localStorage
 * @returns {Array} Array of saved sessions
 */
export const getSavedSessions = () => {
  try {
    return JSON.parse(localStorage.getItem('neuroaid_sessions') || '[]');
  } catch (error) {
    console.error('Error reading sessions:', error);
    return [];
  }
};

/**
 * Analyzes emotions from a session
 * @param {Array} sessionData - Array of emotion data from a session
 * @returns {Object} Analysis results
 */
export const analyzeSessionEmotions = (sessionData) => {
  // Skip if no data
  if (!sessionData?.length) return null;

  // Calculate emotion frequencies
  const emotionCounts = sessionData.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {});

  // Get top emotions
  const topEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([emotion, count]) => ({
      emotion,
      percentage: (count / sessionData.length * 100).toFixed(1)
    }));

  // Calculate crying episodes
  const cryingEpisodes = sessionData.reduce((acc, entry, index) => {
    if (entry.isCrying) {
      if (!acc.inEpisode) {
        acc.episodes++;
        acc.inEpisode = true;
        acc.ranges.push({
          start: entry.timestamp,
          end: entry.timestamp
        });
      } else {
        acc.ranges[acc.ranges.length - 1].end = entry.timestamp;
      }
      acc.totalTime++;
    } else {
      acc.inEpisode = false;
    }
    return acc;
  }, { episodes: 0, totalTime: 0, ranges: [], inEpisode: false });

  return {
    topEmotions,
    cryingEpisodes: {
      count: cryingEpisodes.episodes,
      totalTime: cryingEpisodes.totalTime / 10, // Convert to seconds (assuming 100ms intervals)
      ranges: cryingEpisodes.ranges.map(range => ({
        start: new Date(range.start).toLocaleTimeString(),
        end: new Date(range.end).toLocaleTimeString()
      }))
    },
    sessionDuration: (sessionData[sessionData.length - 1]?.timestamp - sessionData[0]?.timestamp) / 1000
  };
}; 
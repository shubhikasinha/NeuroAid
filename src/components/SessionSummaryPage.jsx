import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SessionSummaryPage = ({ sessionData }) => {
  // Format date and duration
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    return Math.round(duration / 60000); // Convert ms to minutes
  };

  // Calculate emotional transitions
  const calculateTransitions = () => {
    if (!sessionData?.emotions?.length) return 0;
    
    let transitions = 0;
    let lastDominant = '';
    
    sessionData.emotions.forEach(emotion => {
      const dominant = Object.entries(emotion)
        .filter(([key]) => !['timestamp', 'isCrying'].includes(key))
        .reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      
      if (dominant !== lastDominant) {
        transitions++;
        lastDominant = dominant;
      }
    });
    
    return transitions - 1; // Subtract first "transition"
  };

  // Determine overall mood
  const determineOverallMood = () => {
    if (!sessionData?.emotions?.length) return 'Not enough data';
    
    const emotionCounts = sessionData.emotions.reduce((acc, emotion) => {
      const dominant = Object.entries(emotion)
        .filter(([key]) => !['timestamp', 'isCrying'].includes(key))
        .reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      acc[dominant] = (acc[dominant] || 0) + 1;
      return acc;
    }, {});

    const primaryMood = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
      
    const hasSadness = emotionCounts.sad > (sessionData.emotions.length * 0.2);
    
    return hasSadness ? `${primaryMood} with brief sadness` : primaryMood;
  };

  // Process emotion data for the line chart
  const processEmotionData = () => {
    if (!sessionData?.emotions?.length) return null;

    const emotions = sessionData.emotions;
    const timestamps = emotions.map(e => new Date(e.timestamp).toLocaleTimeString());
    
    // Get all emotion types except timestamp and isCrying
    const emotionTypes = Object.keys(emotions[0]).filter(key => !['timestamp', 'isCrying'].includes(key));
    
    // Create datasets for each emotion
    const datasets = emotionTypes.map(emotion => ({
      label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      data: emotions.map(e => e[emotion]),
      fill: false,
      borderColor: getEmotionColor(emotion),
      tension: 0.4,
      borderWidth: 2
    }));

    return {
      labels: timestamps,
      datasets
    };
  };

  // Get color for each emotion
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'rgb(255, 193, 7)',
      sad: 'rgb(33, 150, 243)',
      angry: 'rgb(244, 67, 54)',
      fearful: 'rgb(156, 39, 176)',
      disgusted: 'rgb(76, 175, 80)',
      surprised: 'rgb(255, 152, 0)',
      neutral: 'rgb(158, 158, 158)'
    };
    return colors[emotion] || 'rgb(158, 158, 158)';
  };

  // Determine session phases
  const determinePhases = () => {
    if (!sessionData?.emotions?.length) return null;
    
    const emotions = sessionData.emotions;
    const totalPoints = emotions.length;
    
    // Split into three phases
    const startPhase = emotions.slice(0, Math.floor(totalPoints / 3));
    const middlePhase = emotions.slice(Math.floor(totalPoints / 3), Math.floor(2 * totalPoints / 3));
    const endPhase = emotions.slice(Math.floor(2 * totalPoints / 3));
    
    // Analyze each phase
    return {
      start: analyzePhase(startPhase),
      middle: analyzePhase(middlePhase),
      end: analyzePhase(endPhase)
    };
  };

  // Analyze a phase of the session
  const analyzePhase = (phaseData) => {
    if (!phaseData.length) return 'No data';
    
    const dominantEmotions = phaseData.reduce((acc, emotion) => {
      const dominant = Object.entries(emotion)
        .filter(([key]) => !['timestamp', 'isCrying'].includes(key))
        .reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      acc[dominant] = (acc[dominant] || 0) + 1;
      return acc;
    }, {});

    const mainEmotion = Object.entries(dominantEmotions)
      .sort((a, b) => b[1] - a[1])[0][0];

    // Map emotions to descriptive terms
    const emotionDescriptions = {
      neutral: 'Stable and reflective',
      happy: 'Positive and engaged',
      sad: 'Dip into sadness',
      calm: 'Calmer, more open',
      angry: 'Intense and expressive',
      fearful: 'Cautious and reserved',
      surprised: 'Alert and responsive'
    };

    return emotionDescriptions[mainEmotion] || 'Mixed emotions';
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: value => `${(value * 100).toFixed(0)}%`
        }
      },
      x: {
        display: true,
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const emotionData = processEmotionData();
  const phases = determinePhases();

  // Add a back button to return to session
  const handleBackToSession = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <button
            onClick={handleBackToSession}
            className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Session
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Session Summary
          </h1>
          <p className="text-lg text-gray-600">
            {formatDate(sessionData?.startTime)} • {formatDuration(sessionData?.duration)} minutes
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Session Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Duration</span>
                  <span className="font-semibold">{formatDuration(sessionData?.duration)} minutes</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Mood Detected</span>
                  <span className="font-semibold">{determineOverallMood()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Emotional Shifts</span>
                  <span className="font-semibold">{calculateTransitions()} transitions</span>
                </div>
              </div>
              <p className="mt-6 text-lg text-blue-600 font-medium">
                You showed up for yourself today. Here's how it went.
              </p>
            </div>

            {/* Emotion Graph Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Emotional Journey</h2>
              <div className="h-96">
                {emotionData && <Line data={emotionData} options={chartOptions} />}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4">
            {/* Highlights Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Highlights</h2>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-lg mb-2 text-blue-600">Start</h3>
                  <p className="text-gray-700">{phases?.start}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-lg mb-2 text-blue-600">Middle</h3>
                  <p className="text-gray-700">{phases?.middle}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-lg mb-2 text-blue-600">End</h3>
                  <p className="text-gray-700">{phases?.end}</p>
                </div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Next Steps</h2>
              <div className="space-y-4">
                <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <span>📥</span> Download Report
                </button>
                <button className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <span>📅</span> Schedule Next Session
                </button>
                <button className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <span>📔</span> View Journal
                </button>
                <button className="w-full py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                  <span>🧘‍♀️</span> Take a Guided Break
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryPage; 
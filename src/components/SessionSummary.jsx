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

const SessionSummary = ({ sessionData }) => {
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

  return (
    <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto">
      {/* Session Overview */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-6">Session Overview</h2>
        <div className="space-y-3 text-lg">
          <p className="text-gray-600">
            Date & Time: {formatDate(sessionData?.startTime)} – {formatDuration(sessionData?.duration)} min
          </p>
          <p className="text-gray-600">
            Mood Detected: {determineOverallMood()}
          </p>
          <p className="text-gray-600">
            Emotional Shifts: {calculateTransitions()} transitions
          </p>
        </div>
        <p className="text-xl mt-6 text-blue-600 font-medium">
          You showed up for yourself today. Here's how it went.
        </p>
      </div>

      {/* Emotion Graph */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4">Emotional Journey</h3>
        <div className="bg-white rounded-lg p-4 h-80">
          {emotionData && <Line data={emotionData} options={chartOptions} />}
        </div>
      </div>

      {/* Highlights */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-6">Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-lg mb-2">Start</h4>
            <p className="text-gray-600">{phases?.start}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-lg mb-2">Middle</h4>
            <p className="text-gray-600">{phases?.middle}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-lg mb-2">End</h4>
            <p className="text-gray-600">{phases?.end}</p>
          </div>
        </div>
      </div>

      {/* Session Insights */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Session Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Speech Activity</p>
            <p className="text-gray-600">78% engaged</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Facial Cues</p>
            <p className="text-gray-600">8 significant expressions</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Tone Variation</p>
            <p className="text-gray-600">Mild–moderate</p>
          </div>
        </div>
        <p className="text-lg mt-4 text-green-600 font-medium">
          "You were expressive — that's a strength."
        </p>
      </div>

      {/* Next Steps */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Download Report
          </button>
          <button className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Schedule Next Session
          </button>
          <button className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            View Journal
          </button>
          <button className="p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Take a Guided Break
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary; 
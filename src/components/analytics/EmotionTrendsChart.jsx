import React, { useMemo } from 'react';

const EmotionTrendsChart = ({ sessionData }) => {
  if (!sessionData?.length) return null;

  // Memoize processed data to avoid recalculation
  const {
    emotions,
    emotionColors,
    timeLabels,
    normalizedData
  } = useMemo(() => {
    const emotions = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral', 'crying'];
    const emotionColors = {
      happy: '#4caf50',
      sad: '#2196f3',
      angry: '#f44336',
      fearful: '#ff9800',
      disgusted: '#9c27b0',
      surprised: '#00bcd4',
      neutral: '#607d8b',
      crying: '#e91e63'
    };

    // Create time labels at regular intervals
    const startTime = sessionData[0].timestamp;
    const endTime = sessionData[sessionData.length - 1].timestamp;
    const duration = endTime - startTime;
    const numLabels = 8; // Increased number of labels
    const timeLabels = Array.from({ length: numLabels }, (_, i) => {
      const timestamp = startTime + (duration * i) / (numLabels - 1);
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit',
        minute: '2-digit', 
        second: '2-digit' 
      });
    });

    // Normalize data points for smoother curves
    const normalizedData = emotions.map(emotion => {
      return sessionData.map(entry => ({
        x: ((entry.timestamp - startTime) / duration) * 100,
        y: emotion === 'crying' ? (entry.isCrying ? 100 : 0) : entry.emotions[emotion] * 100,
        value: emotion === 'crying' ? (entry.isCrying ? 1 : 0) : entry.emotions[emotion],
        timestamp: entry.timestamp
      }));
    });

    return { emotions, emotionColors, timeLabels, normalizedData };
  }, [sessionData]);

  // SVG dimensions and padding
  const width = '100%';
  const height = 400; // Increased height
  const padding = 60; // Increased padding
  const graphHeight = height - padding * 2;

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: '#333', marginBottom: '20px' }}>Emotion Trends</h3>
      
      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: '12px',
        borderRadius: '8px'
      }}>
        {emotions.map(emotion => (
          <div key={emotion} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '24px',
              height: '3px',
              backgroundColor: emotionColors[emotion],
              borderRadius: '2px'
            }} />
            <span style={{
              fontSize: '14px',
              color: '#333',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {emotion}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Grid lines */}
          {[0, 20, 40, 60, 80, 100].map(y => (
            <g key={y}>
              <line
                x1={`${padding}%`}
                y1={padding + (y / 100) * graphHeight}
                x2="95%"
                y2={padding + (y / 100) * graphHeight}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
              <text
                x={`${padding - 10}%`}
                y={padding + (y / 100) * graphHeight}
                fontSize="12"
                fill="#666"
                dominantBaseline="middle"
                textAnchor="end"
              >
                {100 - y}%
              </text>
            </g>
          ))}

          {/* Time labels */}
          {timeLabels.map((label, i) => (
            <text
              key={i}
              x={`${padding + (i / (timeLabels.length - 1)) * (95 - padding)}%`}
              y={height - padding/2}
              fontSize="12"
              fill="#666"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

          {/* Emotion lines */}
          {normalizedData.map((points, i) => (
            <g key={emotions[i]}>
              <path
                d={`M ${points.map(p => 
                  `${padding + (p.x * (95 - padding) / 100)}% ${padding + ((100 - p.y) * graphHeight / 100)}`
                ).join(' L ')}`}
                fill="none"
                stroke={emotionColors[emotions[i]]}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={emotions[i] === 'crying' ? '1' : '0.7'}
              />
              
              {/* Data points with tooltips */}
              {points.map((p, j) => (
                <g key={j}>
                  <circle
                    cx={`${padding + (p.x * (95 - padding) / 100)}%`}
                    cy={padding + ((100 - p.y) * graphHeight / 100)}
                    r="4"
                    fill={emotionColors[emotions[i]]}
                    stroke="#fff"
                    strokeWidth="2"
                    opacity={emotions[i] === 'crying' ? '1' : '0.7'}
                  >
                    <title>{`${emotions[i]}: ${(p.value * 100).toFixed(1)}%
Time: ${new Date(p.timestamp).toLocaleTimeString()}`}</title>
                  </circle>
                </g>
              ))}
            </g>
          ))}

          {/* Axes */}
          <line
            x1={`${padding}%`}
            y1={padding}
            x2={`${padding}%`}
            y2={height - padding}
            stroke="#ccc"
            strokeWidth="2"
          />
          <line
            x1={`${padding}%`}
            y1={height - padding}
            x2="95%"
            y2={height - padding}
            stroke="#ccc"
            strokeWidth="2"
          />
          
          {/* Y-axis label */}
          <text
            x="20"
            y={height/2}
            transform={`rotate(-90 20 ${height/2})`}
            fontSize="14"
            fill="#666"
            textAnchor="middle"
            fontWeight="500"
          >
            Intensity (%)
          </text>
        </svg>
      </div>
    </div>
  );
};

export default EmotionTrendsChart; 
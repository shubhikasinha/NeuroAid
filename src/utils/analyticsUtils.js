// Calculate the dominant emotion for a given emotions object
export const getDominantEmotion = (emotions) => {
  return Object.entries(emotions)
    .reduce((a, b) => (a[1] > b[1] ? a : b))[0];
};

// Calculate emotional intensity (0-1) from emotions object
export const calculateIntensity = (emotions) => {
  return Math.max(...Object.values(emotions));
};

// Calculate emotional balance score (-1 to 1)
export const calculateWellnessScore = (sessionData) => {
  if (!sessionData?.length) return 0;

  const avgEmotions = sessionData.reduce((acc, entry) => {
    Object.entries(entry.emotions).forEach(([emotion, value]) => {
      acc[emotion] = (acc[emotion] || 0) + value;
    });
    return acc;
  }, {});

  Object.keys(avgEmotions).forEach(emotion => {
    avgEmotions[emotion] /= sessionData.length;
  });

  const cryingEpisodes = sessionData.filter(e => e.isCrying).length;
  const cryingFactor = cryingEpisodes / sessionData.length;

  return (
    (avgEmotions.happy * 2 + avgEmotions.neutral) -
    (avgEmotions.sad + avgEmotions.angry + avgEmotions.fearful + cryingFactor * 2)
  );
};

// Generate insight for dominant emotion
const generateDominantEmotionInsight = (emotion) => {
  const insights = {
    happy: {
      emoji: '😊',
      title: 'Positive Emotional State',
      description: 'You maintained a generally positive disposition during this session. This suggests good emotional well-being.'
    },
    neutral: {
      emoji: '😐',
      title: 'Balanced Emotional State',
      description: 'You appeared calm and steady throughout most of the session, showing good emotional regulation.'
    },
    sad: {
      emoji: '😢',
      title: 'Signs of Sadness',
      description: 'The session revealed some emotional heaviness. It\'s okay to feel this way, and expressing these feelings can be therapeutic.'
    },
    angry: {
      emoji: '😠',
      title: 'Heightened Tension',
      description: 'There were noticeable signs of frustration or anger. Consider exploring what triggered these feelings.'
    },
    fearful: {
      emoji: '😨',
      title: 'Anxiety Indicators',
      description: 'The session showed signs of anxiety or unease. This might be a good time to practice some calming techniques.'
    }
  };

  return insights[emotion] || {
    emoji: '🤔',
    title: 'Mixed Emotions',
    description: 'Your emotional state varied throughout the session, which is completely normal.'
  };
};

// Generate insight for crying episodes
const generateCryingInsight = (episodes) => {
  if (episodes > 5) {
    return {
      emoji: '💭',
      title: 'Emotional Release',
      description: `There were ${episodes} moments of intense emotion. This can be a healthy way to process deep feelings.`
    };
  }
  return {
    emoji: '💧',
    title: 'Brief Emotional Moments',
    description: `You experienced ${episodes} brief emotional moment(s). This shows you're in touch with your feelings.`
  };
};

// Generate insight for emotional stability
const generateStabilityInsight = (shifts, duration) => {
  const shiftsPerMinute = (shifts / duration) * 60;
  if (shiftsPerMinute > 2) {
    return {
      emoji: '🌊',
      title: 'Dynamic Emotional Flow',
      description: 'Your emotions showed significant variation, which might reflect processing of complex feelings.'
    };
  }
  return {
    emoji: '🌟',
    title: 'Emotional Stability',
    description: 'You maintained relatively stable emotional states, showing good emotional regulation.'
  };
};

// Generate session insights
export const generateSessionInsights = (sessionData) => {
  if (!sessionData?.length) return [];

  const insights = [];
  const metrics = {
    duration: (sessionData[sessionData.length - 1].timestamp - sessionData[0].timestamp) / 1000,
    cryingEpisodes: sessionData.filter(e => e.isCrying).length,
    dominantEmotion: getDominantEmotion(
      sessionData.reduce((acc, entry) => {
        Object.entries(entry.emotions).forEach(([emotion, value]) => {
          acc[emotion] = (acc[emotion] || 0) + value;
        });
        return acc;
      }, {})
    ),
    emotionalShifts: sessionData.reduce((shifts, entry, i, arr) => {
      if (i === 0) return shifts;
      const prevDominant = getDominantEmotion(arr[i-1].emotions);
      const currentDominant = getDominantEmotion(entry.emotions);
      return prevDominant !== currentDominant ? shifts + 1 : shifts;
    }, 0)
  };

  // Dominant emotion insight
  insights.push(generateDominantEmotionInsight(metrics.dominantEmotion));

  // Crying episodes insight
  if (metrics.cryingEpisodes > 0) {
    insights.push(generateCryingInsight(metrics.cryingEpisodes));
  }

  // Emotional stability insight
  insights.push(generateStabilityInsight(metrics.emotionalShifts, metrics.duration));

  return insights;
};

// Generate recommendations based on session analysis
export const generateRecommendations = (sessionData) => {
  if (!sessionData?.length) return [];

  const recommendations = [];
  const metrics = {
    cryingEpisodes: sessionData.filter(e => e.isCrying).length,
    emotionalShifts: sessionData.reduce((shifts, entry, i, arr) => {
      if (i === 0) return shifts;
      const prevDominant = getDominantEmotion(arr[i-1].emotions);
      const currentDominant = getDominantEmotion(entry.emotions);
      return prevDominant !== currentDominant ? shifts + 1 : shifts;
    }, 0),
    dominantEmotion: getDominantEmotion(
      sessionData.reduce((acc, entry) => {
        Object.entries(entry.emotions).forEach(([emotion, value]) => {
          acc[emotion] = (acc[emotion] || 0) + value;
        });
        return acc;
      }, {})
    )
  };

  if (metrics.cryingEpisodes > 5) {
    recommendations.push(
      'Consider journaling about the feelings that surfaced during this session.',
      'Practice self-care activities that help you feel grounded and supported.'
    );
  }

  if (metrics.emotionalShifts > 10) {
    recommendations.push(
      'Try mindfulness exercises to help stabilize your emotional state.',
      'Identify specific triggers that might be causing emotional fluctuations.'
    );
  }

  if (metrics.dominantEmotion === 'neutral') {
    recommendations.push(
      'Continue practicing emotional awareness to maintain this balance.',
      'Consider exploring ways to safely express and process deeper emotions.'
    );
  }

  // Add general recommendations if list is empty
  if (recommendations.length === 0) {
    recommendations.push(
      'Continue regular check-ins with your emotions.',
      'Practice mindful breathing during future sessions.',
      'Consider setting emotional wellness goals for your next session.'
    );
  }

  return [...new Set(recommendations)]; // Remove duplicates
}; 
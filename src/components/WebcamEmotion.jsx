import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

const WebcamEmotion = ({ isRecording, isCameraActive, onEmotionDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
      
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
        console.log('Models loaded successfully');
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    const startVideo = async () => {
      try {
        if (isCameraActive && !streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
              frameRate: { ideal: 30 }
            } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    const stopVideo = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    if (isCameraActive) {
      startVideo();
    } else {
      stopVideo();
    }

    return () => {
      stopVideo();
    };
  }, [isCameraActive]);

  useEffect(() => {
    let detectionInterval;

    const detectEmotions = async () => {
      if (!videoRef.current || !isModelLoaded || !isRecording) return;

      try {
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.2 })
          )
          .withFaceExpressions();

        if (detections) {
          const timestamp = Date.now();
          const emotionData = {
            timestamp,
            ...detections.expressions,
            isCrying: detections.expressions.sad > 0.6
          };
          
          onEmotionDetected(emotionData);
        }
      } catch (error) {
        console.error('Error detecting emotions:', error);
      }
    };

    if (isRecording && isModelLoaded) {
      detectionInterval = setInterval(detectEmotions, 1000); // Detect every second
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [isRecording, isModelLoaded, onEmotionDetected]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)' // Mirror effect
        }}
      />
      {!isModelLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'medium'
        }}>
          Loading emotion detection models...
        </div>
      )}
    </div>
  );
};

export default WebcamEmotion;

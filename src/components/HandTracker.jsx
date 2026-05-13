import React, { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useInteraction } from '../context/InteractionContext';

const HandTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const { updateHands } = useInteraction();

  useEffect(() => {
    const initializeHandLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      startWebcam();
    };

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    const predictWebcam = async () => {
      if (!handLandmarkerRef.current || !videoRef.current || !canvasRef.current) return;

      const startTimeMs = performance.now();
      const results = await handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const detectedHands = [];
      if (results.landmarks && results.landmarks.length > 0) {
        results.landmarks.forEach((landmarks, index) => {
          // Calculate 2-Finger Pinch (Rotate/Zoom)
          const indexTip = landmarks[8];
          const thumbTip = landmarks[4];
          const middleTip = landmarks[12];
          
          const pinchDist2 = Math.sqrt(Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2));
          const isPinching = pinchDist2 < 0.05;

          // Calculate 3-Finger Pinch (Move Up/Down)
          const pinchDist3 = Math.sqrt(Math.pow(middleTip.x - thumbTip.x, 2) + Math.pow(middleTip.y - thumbTip.y, 2));
          const isThreeFingerPinch = isPinching && pinchDist3 < 0.06;

          // Draw skeleton with color feedback
          // 3-Finger: Gold, 2-Finger: Pink, Normal: Cyan
          const color = isThreeFingerPinch ? "#ffcc00" : (isPinching ? "#ff007a" : "#00f2ff");
          canvasCtx.strokeStyle = color;
          canvasCtx.lineWidth = 2;
          
          landmarks.forEach(point => {
            const px = point.x * canvasRef.current.width;
            const py = point.y * canvasRef.current.height;
            canvasCtx.beginPath();
            canvasCtx.arc(px, py, 3, 0, 2 * Math.PI);
            canvasCtx.fillStyle = color;
            canvasCtx.fill();
          });

          const palm = landmarks[0];
          detectedHands.push({
            id: index,
            x: palm.x, 
            y: palm.y,
            isPinching,
            isThreeFingerPinch,
            landmarks
          });
        });
      }

      updateHands(detectedHands);
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    initializeHandLandmarker();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [updateHands]);

  return (
    <div className="webcam-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{
          width: '280px',
          height: '210px',
          borderRadius: '12px',
          border: '2px solid var(--accent-cyan)',
          transform: 'scaleX(-1)', 
          background: '#000',
          filter: 'brightness(1.2) contrast(1.4)',
          boxShadow: '0 0 30px rgba(0, 242, 255, 0.4)'
        }}
      />
      <canvas
        ref={canvasRef}
        width={280}
        height={210}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '280px',
          height: '210px',
          pointerEvents: 'none',
          transform: 'scaleX(-1)'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '-25px',
        right: 0,
        fontSize: '0.65rem',
        color: 'var(--accent-cyan)',
        textTransform: 'uppercase',
        fontWeight: 800,
        letterSpacing: '1px'
      }}>
        Neural Calibration Active
      </div>
    </div>
  );
};

export default HandTracker;

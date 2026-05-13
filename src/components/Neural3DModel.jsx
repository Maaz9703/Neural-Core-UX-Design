import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Center } from '@react-three/drei';
import { useInteraction } from '../context/InteractionContext';

const Neural3DModel = () => {
  const points = useRef();
  const { uploadedImage, handData } = useInteraction();
  
  // Hand Zoom State
  const scaleRef = useRef(1);
  const lastPinchDistance = useRef(null);

  const [geometry, material] = useMemo(() => {
    if (!uploadedImage) return [null, null];

    const img = new Image();
    img.src = uploadedImage;
    
    // We'll create the geometry once the image is loaded in a useEffect
    // For now return placeholders
    return [null, null];
  }, [uploadedImage]);

  useEffect(() => {
    if (!uploadedImage) return;

    const img = new Image();
    img.src = uploadedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 128; // Resolution of the 3D model
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      
      const imageData = ctx.getImageData(0, 0, size, size).data;
      const positions = new Float32Array(size * size * 3);
      const colors = new Float32Array(size * size * 3);
      const originalPositions = new Float32Array(size * size * 3);

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const idx = (i * size + j);
          const r = imageData[idx * 4] / 255;
          const g = imageData[idx * 4 + 1] / 255;
          const b = imageData[idx * 4 + 2] / 255;
          
          // Z coordinate based on brightness (Neural Extrusion)
          const brightness = (r + g + b) / 3;
          const z = brightness * 2; 

          positions[idx * 3] = (j / size - 0.5) * 5;
          positions[idx * 3 + 1] = -(i / size - 0.5) * 5;
          positions[idx * 3 + 2] = z;

          originalPositions[idx * 3] = positions[idx * 3];
          originalPositions[idx * 3 + 1] = positions[idx * 3 + 1];
          originalPositions[idx * 3 + 2] = z;

          colors[idx * 3] = r;
          colors[idx * 3 + 1] = g;
          colors[idx * 3 + 2] = b;
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.userData.originalPositions = originalPositions;
      
      if (points.current) {
        points.current.geometry = geo;
      }
    };
  }, [uploadedImage]);

  useFrame((state) => {
    if (!points.current || !points.current.geometry) return;

    // 1. Zoom Interaction (Pinch Distance)
    if (handData.isPresent && handData.landmarks) {
      const thumb = handData.landmarks[4];
      const index = handData.landmarks[8];
      const dist = Math.sqrt(Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2));

      if (handData.isPinching) {
        if (lastPinchDistance.current !== null) {
          const delta = dist - lastPinchDistance.current;
          scaleRef.current = Math.max(0.1, Math.min(5, scaleRef.current + delta * 10));
        }
        lastPinchDistance.current = dist;
      } else {
        lastPinchDistance.current = null;
      }
    }

    points.current.scale.setScalar(THREE.MathUtils.lerp(points.current.scale.x, scaleRef.current, 0.1));

    // 2. Rotation Sync
    points.current.rotation.y = THREE.MathUtils.lerp(points.current.rotation.y, (handData.x - 0.5) * Math.PI, 0.05);
    points.current.rotation.x = THREE.MathUtils.lerp(points.current.rotation.x, (handData.y - 0.5) * Math.PI * 0.5, 0.05);

    // 3. Shatter Interaction
    // If user moves hand fast while pinching, "explode" the particles
    const positions = points.current.geometry.attributes.position.array;
    const original = points.current.geometry.userData.originalPositions;
    
    for (let i = 0; i < positions.length; i += 3) {
      if (handData.isPinching && scaleRef.current > 2) { // "Shatter" if zoomed in high while pinching
        positions[i] += (Math.random() - 0.5) * 0.1;
        positions[i + 1] += (Math.random() - 0.5) * 0.1;
        positions[i + 2] += (Math.random() - 0.5) * 0.1;
      } else {
        // "Join" back to original positions
        positions[i] = THREE.MathUtils.lerp(positions[i], original[i], 0.1);
        positions[i + 1] = THREE.MathUtils.lerp(positions[i + 1], original[i + 1], 0.1);
        positions[i + 2] = THREE.MathUtils.lerp(positions[i + 2], original[i + 2], 0.1);
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!uploadedImage) return null;

  return (
    <Center>
      <points ref={points}>
        <pointsMaterial size={0.03} vertexColors />
      </points>
    </Center>
  );
};

export default Neural3DModel;

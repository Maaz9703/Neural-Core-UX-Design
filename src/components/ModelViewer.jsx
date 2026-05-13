import React, { useRef, useEffect } from 'react';
import { useGLTF, Float, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInteraction } from '../context/InteractionContext';

const MODELS = {
  flower: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Flower/Flower.glb',
  drone: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/mali-bead/model.gltf'
};

const ModelViewer = () => {
  const group = useRef();
  const lastHandRef = useRef({ x: 0, y: 0 });
  const { handsRef, selectedModel, uploadedScene } = useInteraction();
  
  // High-Stability Loader: Handles both Direct Objects and Library URLs
  const { scene: libraryScene } = useGLTF(MODELS[selectedModel] || MODELS.flower);
  const scene = uploadedScene instanceof THREE.Group || uploadedScene instanceof THREE.Scene 
    ? uploadedScene 
    : libraryScene;

  useFrame((state) => {
    if (!group.current || !scene) return;
    const hands = handsRef.current;

    // --- SPATIAL COMMAND LOGIC ---
    if (hands.length === 1) {
      const h = hands[0];
      const dx = h.x - lastHandRef.current.x;
      const dy = h.y - lastHandRef.current.y;

      // 1. Three-Finger Move (Up/Down)
      if (h.isThreeFingerPinch) {
        group.current.position.y -= dy * 5; // Direct Y translation
      } 
      // 2. Two-Finger Grab (Rotate)
      else if (h.isPinching) {
        group.current.rotation.y -= dx * 4; // Calibrated speed
        group.current.rotation.x += dy * 4;
      }

      lastHandRef.current = { x: h.x, y: h.y };

      // Glow Feedback
      const isActive = h.isPinching || h.isThreeFingerPinch;
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => {
            if (m.emissive) {
              m.emissive.set(h.isThreeFingerPinch ? "#ffcc00" : "#00f2ff");
              m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity || 0, isActive ? 1.5 : 0, 0.2);
            }
          });
        }
      });
    }

    // 3. Two-Hand Zoom (Only if both hands are pinching)
    if (hands.length === 2 && hands[0].isPinching && hands[1].isPinching) {
      const dist = Math.sqrt(Math.pow(hands[0].x - hands[1].x, 2) + Math.pow(hands[0].y - hands[1].y, 2));
      const targetScale = Math.max(0.1, Math.min(10, 1 + (dist - 0.35) * 8));
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.2));
    }
  });

  return (
    <Center>
      <primitive ref={group} object={scene} />
    </Center>
  );
};

export default ModelViewer;

import React, { useRef, useState, useEffect } from 'react';
import { useGLTF, Float, Html, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInteraction } from '../context/InteractionContext';

const RealisticFlower = () => {
  const group = useRef();
  const { handData } = useInteraction();
  const { scene } = useGLTF('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Flower/Flower.glb');
  
  // State for plucked petals: { meshId: { offset: Vector3, isPlucked: bool } }
  const [pluckedState, setPluckedState] = useState({});
  const lastInteractionRef = useRef(null);

  useEffect(() => {
    // Clone scene to avoid shared state if reused
    const flower = scene.clone();
    group.current.add(flower);

    // Initial setup: give each child a unique ID and track original position
    flower.traverse((child) => {
      if (child.isMesh) {
        child.userData.originalPosition = child.position.clone();
        child.userData.originalRotation = child.rotation.clone();
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current || !handData.isPresent) return;

    // Convert hand screen coordinates to 3D world space (approximate)
    const handX = (handData.x - 0.5) * 10;
    const handY = -(handData.y - 0.5) * 10;
    const handPos = new THREE.Vector3(handX, handY, 0);

    // Rotation sync (Blender style)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (handData.x - 0.5) * Math.PI, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (handData.y - 0.5) * Math.PI * 0.5, 0.05);

    // Interaction logic: Plucking petals
    if (handData.isPinching) {
      // Find closest mesh to hand
      let closestMesh = null;
      let minDistance = 1.5; // Threshold for grabbing

      group.current.traverse((child) => {
        if (child.isMesh) {
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          const dist = worldPos.distanceTo(handPos);
          if (dist < minDistance) {
            minDistance = dist;
            closestMesh = child;
          }
        }
      });

      if (closestMesh) {
        // "Pluck" the mesh: move it towards hand
        const targetPos = group.current.worldToLocal(handPos.clone());
        closestMesh.position.lerp(targetPos, 0.1);
        closestMesh.userData.isPlucked = true;
      }
    } else {
      // If not pinching, slowly return plucked petals to original position (optional)
      // For "breaking", we might want them to stay broken or fall.
      // Let's make them fall slowly if plucked.
      group.current.traverse((child) => {
        if (child.isMesh && child.userData.isPlucked) {
          // child.position.y -= 0.01; // Gravity effect
          // Or just leave them where they were plucked
        }
      });
    }

    // Dynamic Color Shift based on Hand Y position
    const colorH = (handData.y * 360) % 360;
    const color = new THREE.Color(`hsl(${colorH}, 70%, 50%)`);
    group.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color.lerp(color, 0.01);
      }
    });
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Center top>
        <group ref={group} scale={1} position={[0, 0, 0]}>
          {/* The model is added via useEffect */}
        </group>
      </Center>
    </Float>
  );
};

export default RealisticFlower;

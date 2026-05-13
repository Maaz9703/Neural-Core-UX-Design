import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Html } from '@react-three/drei';
import { useInteraction } from '../context/InteractionContext';
import ModelViewer from './ModelViewer';
import SpaceBackground from './SpaceBackground';
import ErrorBoundary from './ErrorBoundary';

const LotusScene = () => {
  const { selectedModel, uploadedScene } = useInteraction();
  const modelKey = uploadedScene || selectedModel;

  return (
    <div className="canvas-container">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        
        <ErrorBoundary>
          <Suspense fallback={<Html center><p style={{ color: 'var(--accent-cyan)' }}>LOADING...</p></Html>}>
            <ModelViewer key={modelKey} />
          </Suspense>
        </ErrorBoundary>

        <Environment preset="city" />
        <SpaceBackground />
      </Canvas>
    </div>
  );
};

export default LotusScene;

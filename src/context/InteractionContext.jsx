import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const InteractionContext = createContext(null);

export const InteractionProvider = ({ children }) => {
  const [hands, setHands] = useState([]); 
  const handsRef = useRef([]); // High-speed Nerve Link
  const [selectedModel, setSelectedModel] = useState('flower'); 
  const [uploadedScene, setUploadedScene] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('Idle');

  const updateHands = useCallback((newHands) => {
    setHands(newHands);
    handsRef.current = newHands; // Direct write to Nerve Link
  }, []);

  return (
    <InteractionContext.Provider value={{ 
      hands, 
      handsRef, // Export Nerve Link
      updateHands, 
      selectedModel, 
      setSelectedModel, 
      uploadedScene, 
      setUploadedScene,
      loadingStatus,
      setLoadingStatus
    }}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return context;
};

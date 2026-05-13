import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { InteractionProvider } from './context/InteractionContext';
import HandTracker from './components/HandTracker';
import LotusScene from './components/LotusScene';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <InteractionProvider>
      <div className="app-container">
        <AnimatePresence>
          {!isLoggedIn && <Login onLogin={handleLogin} />}
        </AnimatePresence>

        {isLoggedIn && (
          <>
            <HandTracker />
            <LotusScene />
            <Dashboard />
          </>
        )}
      </div>
    </InteractionProvider>
  );
}

export default App;

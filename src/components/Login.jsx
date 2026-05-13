import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleLogin = () => {
    setIsScanning(true);
    setTimeout(() => {
      onLogin();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="login-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(20,20,20,0.8) 0%, #050505 100%)',
        zIndex: 1000,
        backdropFilter: 'blur(20px)'
      }}
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '4px', opacity: 0.6, marginBottom: '10px' }}>
          SECURE ACCESS
        </h2>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-2px' }}>
          Neural Core
        </h1>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogin}
        className="glass-panel"
        style={{
          padding: '40px',
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.03)'
        }}
      >
        <div style={{ position: 'relative' }}>
          <Fingerprint size={64} color={isScanning ? 'var(--accent-cyan)' : 'white'} />
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  background: 'linear-gradient(transparent, var(--accent-cyan))',
                  opacity: 0.3,
                  pointerEvents: 'none'
                }}
              />
            )}
          </AnimatePresence>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>
            {isScanning ? 'SCANNING NEURAL MAPPING...' : 'PLACE HAND TO SYNC'}
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
            Biometric Encryption v2.4
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1 }}
        style={{ position: 'absolute', bottom: '40px', fontSize: '0.8rem' }}
      >
        PROTECTED BY RAPTR MAAZ QUANTUM ENCRYPTION
      </motion.div>
    </motion.div>
  );
};

export default Login;

import React, { useRef, useState } from 'react';
import { Activity, Zap, Shield, Database, Settings, User, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useInteraction } from '../context/InteractionContext';

const Dashboard = () => {
  const { hands, selectedModel, setSelectedModel, setUploadedScene, loadingStatus, setLoadingStatus } = useInteraction();
  const modelInputRef = useRef();

  const handleModelUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setLoadingStatus('Syncing 7+ Assets...');
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
        const manager = new THREE.LoadingManager();
        const objectURLs = new Map();
        
        files.forEach(file => {
          objectURLs.set(file.name, URL.createObjectURL(file));
        });

        // Pro-Grade Resolver: Handles relative paths and Windows-style backslashes
        manager.setURLModifier((url) => {
          // Normalize path by replacing \ with / and grabbing the filename
          const fileName = decodeURIComponent(url.replace(/\\/g, '/').split('/').pop());
          return objectURLs.get(fileName) || url;
        });

        const loader = new GLTFLoader(manager);
        const mainFile = files.find(f => f.name.toLowerCase().endsWith('.gltf') || f.name.toLowerCase().endsWith('.glb'));

        if (mainFile) {
          loader.load(objectURLs.get(mainFile.name), 
            (gltf) => {
              setUploadedScene(gltf.scene);
              setLoadingStatus('Idle');
            },
            undefined,
            (error) => {
              console.error('Multi-File Sync Failed:', error);
              setLoadingStatus('Error: Check Files');
            }
          );
        }
      } catch (err) {
        setLoadingStatus('Error: Engine Crash');
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar with Linked Hands Status */}
      <motion.aside className="sidebar glass-panel">
        <NavIcon icon={<Activity size={24} />} active />
        <div style={{ fontSize: '0.6rem', color: hands.length > 0 ? 'var(--accent-cyan)' : 'white', fontWeight: 800, textAlign: 'center', marginTop: '10px' }}>
          {hands.length > 0 ? `HANDS LINKED: ${hands.length}` : 'WAITING FOR HANDS'}
        </div>
        <div style={{ marginTop: 'auto' }}><NavIcon icon={<Settings size={24} />} /></div>
      </motion.aside>

      <main className="main-content">
        <header style={{ padding: '20px 0' }}>
          <h1 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>POWER BIOLOGY</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Neural Command Center v2.0</p>
        </header>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <InfoCard title="Command Link" value="SYNCED" color="var(--accent-cyan)" />
          <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ASSETS:</p>
            {['flower', 'drone'].map((m) => (
              <button key={m} onClick={() => { setUploadedScene(null); setSelectedModel(m); }}
                style={{ background: selectedModel === m ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)', color: selectedModel === m ? 'black' : 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                {m.toUpperCase()}
              </button>
            ))}
            <input type="file" ref={modelInputRef} onChange={handleModelUpload} style={{ display: 'none' }} accept=".glb,.gltf,.bin,.jpg,.png" multiple />
            <button onClick={() => modelInputRef.current.click()}
              style={{ background: loadingStatus !== 'Idle' ? 'var(--accent-pink)' : 'rgba(0, 242, 255, 0.1)', color: loadingStatus !== 'Idle' ? 'white' : 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {loadingStatus === 'Idle' ? 'UPLOAD MODEL (MULTI-FILE)' : loadingStatus.toUpperCase()}
            </button>
          </div>
        </div>
      </main>

      {/* Right Stats Panel */}
      <motion.aside 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="stats-panel glass-panel"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="black" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem' }}>Operator</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Admin</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <StatRow label="Frequency" value="442 Hz" />
          <StatRow label="Latency" value="12ms" />
        </div>
      </motion.aside>
    </div>
  );
};

const NavIcon = ({ icon, active }) => (
  <div style={{ cursor: 'pointer', color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)', padding: '10px' }}>
    {icon}
  </div>
);

const InfoCard = ({ title, value, trend, color }) => (
  <div className="glass-panel" style={{ flex: 1, padding: '20px', borderLeft: `4px solid ${color}` }}>
    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{title}</p>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</h2>
      <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{trend}</span>
    </div>
  </div>
);

const StatRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
    <span style={{ opacity: 0.6 }}>{label}</span>
    <span style={{ fontWeight: 600 }}>{value}</span>
  </div>
);

export default Dashboard;

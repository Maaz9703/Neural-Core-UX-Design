import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'var(--accent-pink)',
          padding: '20px',
          background: 'rgba(0,0,0,0.8)',
          borderRadius: '15px',
          border: '1px solid var(--accent-pink)',
          zIndex: 1000
        }}>
          <h2 style={{ marginBottom: '10px' }}>ASSET LOAD FAILURE</h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>The selected Blender model could not be rendered.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: '15px', 
              padding: '10px 20px', 
              background: 'var(--accent-pink)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer' 
            }}
          >
            RELOAD SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

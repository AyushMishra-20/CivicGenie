import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pwaService from '../utils/pwaService';
import './PWAInstallPrompt.css';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Listen for install prompt availability
    const handleInstallPrompt = () => {
      setShowPrompt(true);
    };

    pwaService.on('installPromptAvailable', handleInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      pwaService.off('installPromptAvailable', handleInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaService.showInstallPrompt();
      if (success) {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="pwa-install-prompt"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pwa-install-content">
          <div className="pwa-install-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </div>
          
          <div className="pwa-install-text">
            <h3>Install CiviGenie</h3>
            <p>Get quick access to submit complaints and track their progress</p>
          </div>

          <div className="pwa-install-actions">
            <button
              className="pwa-install-button"
              onClick={handleInstall}
              disabled={isInstalling}
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
            
            <button
              className="pwa-dismiss-button"
              onClick={handleDismiss}
              disabled={isInstalling}
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt; 
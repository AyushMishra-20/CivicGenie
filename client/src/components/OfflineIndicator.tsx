import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pwaService from '../utils/pwaService';
import './OfflineIndicator.css';

const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!pwaService.getOnlineStatus());
  const [offlineComplaints, setOfflineComplaints] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Listen for PWA events
    pwaService.on('online', handleOnline);
    pwaService.on('offline', handleOffline);

    // Check initial status
    setIsOffline(!pwaService.getOnlineStatus());
    loadOfflineComplaints();

    return () => {
      pwaService.off('online', handleOnline);
      pwaService.off('offline', handleOffline);
    };
  }, []);

  const loadOfflineComplaints = async () => {
    try {
      const complaints = await pwaService.getOfflineComplaints();
      const pendingCount = complaints.filter(c => c.status === 'pending').length;
      setOfflineComplaints(pendingCount);
    } catch (error) {
      console.error('Failed to load offline complaints:', error);
    }
  };

  const syncOfflineData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await pwaService.syncOfflineComplaints();
      await loadOfflineComplaints();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = () => {
    if (pwaService.getOnlineStatus()) {
      syncOfflineData();
    }
  };

  if (!isOffline && offlineComplaints === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="offline-indicator"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="offline-indicator-content">
          {isOffline ? (
            <>
              <div className="offline-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 8.98C20.93 5.9 16.69 4 12 4S3.07 5.9 0 8.98L12 21 24 8.98zM2.92 9.07C5.51 7.08 8.67 6 12 6s6.49 1.08 9.08 3.07l-9.08 9.08-9.08-9.08z"/>
                </svg>
              </div>
              <div className="offline-text">
                <span>You're offline</span>
                {offlineComplaints > 0 && (
                  <span className="offline-count">
                    {offlineComplaints} complaint{offlineComplaints !== 1 ? 's' : ''} pending sync
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="offline-icon online">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="offline-text">
                <span>Back online</span>
                {isSyncing ? (
                  <span className="sync-status">Syncing...</span>
                ) : offlineComplaints > 0 ? (
                  <button 
                    className="sync-button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                  >
                    Sync {offlineComplaints} complaint{offlineComplaints !== 1 ? 's' : ''}
                  </button>
                ) : (
                  <span className="sync-status">All data synced</span>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineIndicator; 
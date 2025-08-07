import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pwaService from '../utils/pwaService';
import './SmartSyncIndicator.css';

interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'failed' | 'offline';
  progress?: number;
  message?: string;
  estimatedTime?: number;
  lastSync?: number;
}

const SmartSyncIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [showDetails, setShowDetails] = useState(false);
  const [offlineComplaints, setOfflineComplaints] = useState(0);

  useEffect(() => {
    // Check initial status
    checkSyncStatus();
    loadOfflineComplaints();

    // Listen for PWA events
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, status: 'syncing' }));
      syncData();
    };

    const handleOffline = () => {
      setSyncStatus({ status: 'offline' });
    };

    pwaService.on('online', handleOnline);
    pwaService.on('offline', handleOffline);

    // Auto-sync every 5 minutes when online
    const autoSyncInterval = setInterval(() => {
      if (pwaService.getOnlineStatus() && offlineComplaints > 0) {
        syncData();
      }
    }, 5 * 60 * 1000);

    return () => {
      pwaService.off('online', handleOnline);
      pwaService.off('offline', handleOffline);
      clearInterval(autoSyncInterval);
    };
  }, [offlineComplaints]);

  const checkSyncStatus = async () => {
    if (!pwaService.getOnlineStatus()) {
      setSyncStatus({ status: 'offline' });
      return;
    }

    const complaints = await pwaService.getOfflineComplaints();
    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    setOfflineComplaints(pendingCount);

    if (pendingCount === 0) {
      setSyncStatus({ 
        status: 'completed',
        lastSync: Date.now()
      });
    } else {
      setSyncStatus({ 
        status: 'idle',
        message: `${pendingCount} complaint${pendingCount !== 1 ? 's' : ''} pending sync`
      });
    }
  };

  const loadOfflineComplaints = async () => {
    try {
      const complaints = await pwaService.getOfflineComplaints();
      const pendingCount = complaints.filter(c => c.status === 'pending').length;
      setOfflineComplaints(pendingCount);
    } catch (error) {
      console.error('Failed to load offline complaints:', error);
    }
  };

  const syncData = async () => {
    if (!pwaService.getOnlineStatus()) {
      setSyncStatus({ status: 'offline' });
      return;
    }

    setSyncStatus({ 
      status: 'syncing',
      progress: 0,
      message: 'Syncing offline data...'
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncStatus(prev => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + 10, 90)
        }));
      }, 200);

      await pwaService.syncOfflineComplaints();
      
      clearInterval(progressInterval);
      
      setSyncStatus({
        status: 'completed',
        progress: 100,
        message: 'Sync completed successfully',
        lastSync: Date.now()
      });

      // Update offline complaints count
      await loadOfflineComplaints();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, status: 'idle' }));
      }, 3000);

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus({
        status: 'failed',
        message: 'Sync failed. Please try again.'
      });
    }
  };

  const handleManualSync = () => {
    if (pwaService.getOnlineStatus()) {
      syncData();
    }
  };

  const formatLastSync = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return (
          <motion.div
            className="sync-icon syncing"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
          </motion.div>
        );
      case 'completed':
        return (
          <div className="sync-icon completed">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="sync-icon failed">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
        );
      case 'offline':
        return (
          <div className="sync-icon offline">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 8.98C20.93 5.9 16.69 4 12 4S3.07 5.9 0 8.98L12 21 24 8.98zM2.92 9.07C5.51 7.08 8.67 6 12 6s6.49 1.08 9.08 3.07l-9.08 9.08-9.08-9.08z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="sync-icon idle">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
    }
  };

  // Don't show if no offline data and not syncing
  if (syncStatus.status === 'idle' && offlineComplaints === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`smart-sync-indicator ${syncStatus.status}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="sync-content">
          {getStatusIcon()}
          
          <div className="sync-info">
            <div className="sync-message">
              {syncStatus.message || 'Sync status'}
            </div>
            {syncStatus.lastSync && (
              <div className="sync-time">
                Last sync: {formatLastSync(syncStatus.lastSync)}
              </div>
            )}
          </div>

          {syncStatus.status === 'syncing' && syncStatus.progress !== undefined && (
            <div className="sync-progress">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  style={{ width: `${syncStatus.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="progress-text">{syncStatus.progress}%</span>
            </div>
          )}

          {syncStatus.status === 'idle' && offlineComplaints > 0 && (
            <button
              className="sync-button"
              onClick={(e) => {
                e.stopPropagation();
                handleManualSync();
              }}
            >
              Sync Now
            </button>
          )}
        </div>

        {showDetails && (
          <motion.div
            className="sync-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="details-content">
              <div className="detail-item">
                <span className="detail-label">Offline Complaints:</span>
                <span className="detail-value">{offlineComplaints}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Connection:</span>
                <span className="detail-value">
                  {pwaService.getOnlineStatus() ? 'Online' : 'Offline'}
                </span>
              </div>
              {syncStatus.lastSync && (
                <div className="detail-item">
                  <span className="detail-label">Last Sync:</span>
                  <span className="detail-value">
                    {new Date(syncStatus.lastSync).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartSyncIndicator;

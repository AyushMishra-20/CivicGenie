import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import pwaService from '../utils/pwaService';
import './NotificationSettings.css';

interface NotificationPreferences {
  newComplaints: boolean;
  statusUpdates: boolean;
  aiAnalysis: boolean;
  reminders: boolean;
  weeklyReports: boolean;
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newComplaints: true,
    statusUpdates: true,
    aiAnalysis: true,
    reminders: false,
    weeklyReports: false
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }

    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if subscribed to push notifications
    try {
      const registration = await navigator.serviceWorker?.ready;
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    try {
      const result = await pwaService.requestNotificationPermission();
      setPermission(result.permission);
      
      if (result.granted) {
        await handleSubscribe();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await pwaService.subscribeToPushNotifications();
      setIsSubscribed(!!subscription);
      
      if (subscription) {
        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription,
            preferences
          })
        });
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await pwaService.unsubscribeFromPushNotifications();
      if (success) {
        setIsSubscribed(false);
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Unsubscription failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    
    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
    
    // Update server preferences if subscribed
    if (isSubscribed) {
      fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences)
      }).catch(error => {
        console.error('Failed to update preferences:', error);
      });
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Notifications enabled', color: '#059669', icon: '✓' };
      case 'denied':
        return { text: 'Notifications blocked', color: '#dc2626', icon: '✗' };
      default:
        return { text: 'Notifications not set', color: '#6b7280', icon: '?' };
    }
  };

  const status = getPermissionStatus();

  return (
    <motion.div
      className="notification-settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="notification-header">
        <h2>Notification Settings</h2>
        <div className="permission-status" style={{ color: status.color }}>
          <span className="status-icon">{status.icon}</span>
          <span>{status.text}</span>
        </div>
      </div>

      <div className="notification-content">
        {permission === 'default' && (
          <div className="permission-request">
            <p>Enable push notifications to stay updated on your complaints</p>
            <button
              className="permission-button"
              onClick={handlePermissionRequest}
              disabled={isLoading}
            >
              {isLoading ? 'Requesting...' : 'Enable Notifications'}
            </button>
          </div>
        )}

        {permission === 'granted' && (
          <>
            <div className="subscription-controls">
              {!isSubscribed ? (
                <button
                  className="subscribe-button"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe to Notifications'}
                </button>
              ) : (
                <button
                  className="unsubscribe-button"
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                </button>
              )}
            </div>

            <div className="preferences-section">
              <h3>Notification Types</h3>
              <div className="preferences-list">
                <label className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.newComplaints}
                    onChange={() => handlePreferenceChange('newComplaints')}
                  />
                  <span className="preference-label">
                    <strong>New Complaints</strong>
                    <span className="preference-description">
                      When you submit a new complaint
                    </span>
                  </span>
                </label>

                <label className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.statusUpdates}
                    onChange={() => handlePreferenceChange('statusUpdates')}
                  />
                  <span className="preference-label">
                    <strong>Status Updates</strong>
                    <span className="preference-description">
                      When complaint status changes
                    </span>
                  </span>
                </label>

                <label className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.aiAnalysis}
                    onChange={() => handlePreferenceChange('aiAnalysis')}
                  />
                  <span className="preference-label">
                    <strong>AI Analysis</strong>
                    <span className="preference-description">
                      When AI analysis is complete
                    </span>
                  </span>
                </label>

                <label className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.reminders}
                    onChange={() => handlePreferenceChange('reminders')}
                  />
                  <span className="preference-label">
                    <strong>Reminders</strong>
                    <span className="preference-description">
                      Follow-up reminders for pending complaints
                    </span>
                  </span>
                </label>

                <label className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.weeklyReports}
                    onChange={() => handlePreferenceChange('weeklyReports')}
                  />
                  <span className="preference-label">
                    <strong>Weekly Reports</strong>
                    <span className="preference-description">
                      Weekly summary of your complaints
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        {permission === 'denied' && (
          <div className="permission-denied">
            <p>
              Notifications are blocked. To enable them, please update your browser settings:
            </p>
            <ol>
              <li>Click the lock/info icon in your browser's address bar</li>
              <li>Find "Notifications" in the site settings</li>
              <li>Change the setting to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationSettings; 
import React, { useState, useEffect } from 'react';
import NotificationService, { NotificationPreferencesData } from '../utils/notificationService';
import './NotificationPreferences.css';

interface NotificationPreferencesProps {
  onPreferencesChange: (preferences: NotificationPreferencesData) => void;
  initialPreferences?: NotificationPreferencesData;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onPreferencesChange,
  initialPreferences
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferencesData>(
    initialPreferences || {
      enabled: false,
      browserNotifications: false,
      statusUpdates: true,
      resolutionUpdates: true
    }
  );
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  useEffect(() => {
    onPreferencesChange(preferences);
  }, [preferences, onPreferencesChange]);

  const handleToggle = (field: keyof NotificationPreferencesData) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field: keyof NotificationPreferencesData, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    
    if (granted) {
      setPreferences(prev => ({
        ...prev,
        browserNotifications: true
      }));
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return '✅ Granted';
      case 'denied':
        return '❌ Denied';
      default:
        return '⏳ Not requested';
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'status-granted';
      case 'denied':
        return 'status-denied';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="notification-preferences">
      <div className="preferences-header">
        <h4>🔔 Notification Settings</h4>
        <p>Stay updated on your complaint progress</p>
      </div>

      <div className="preferences-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={() => handleToggle('enabled')}
            className="toggle-input"
          />
          <span className="toggle-slider"></span>
          <span className="toggle-text">Enable notifications</span>
        </label>
      </div>

      {preferences.enabled && (
        <div className="preferences-options">
          <div className="option-group">
            <h5>Contact Information</h5>
            <div className="input-group">
              <label htmlFor="email">Email (optional)</label>
              <input
                id="email"
                type="email"
                value={preferences.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                type="tel"
                value={preferences.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="form-input"
              />
            </div>
          </div>

          <div className="option-group">
            <h5>Notification Types</h5>
            
            <div className="browser-notification-section">
              <div className="browser-notification-header">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={preferences.browserNotifications}
                    onChange={() => handleToggle('browserNotifications')}
                    disabled={!isSupported || permissionStatus === 'denied'}
                    className="toggle-input"
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">Browser notifications</span>
                </label>
                <span className={`permission-status ${getPermissionStatusColor()}`}>
                  {getPermissionStatusText()}
                </span>
              </div>
              
              {isSupported && permissionStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className="permission-btn"
                  disabled={permissionStatus === 'denied'}
                >
                  {permissionStatus === 'denied' ? '🔒 Permission Denied' : '🔔 Enable Browser Notifications'}
                </button>
              )}
              
              {!isSupported && (
                <p className="not-supported">Browser notifications are not supported in this browser</p>
              )}
            </div>

            <div className="notification-types">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.statusUpdates}
                  onChange={() => handleToggle('statusUpdates')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">Status updates (open → in progress → resolved)</span>
              </label>

              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.resolutionUpdates}
                  onChange={() => handleToggle('resolutionUpdates')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">Resolution notifications</span>
              </label>
            </div>
          </div>

          <div className="notification-info">
            <p>💡 You'll receive notifications when:</p>
            <ul>
              {preferences.statusUpdates && <li>Your complaint status changes</li>}
              {preferences.resolutionUpdates && <li>Your complaint is resolved</li>}
              {preferences.browserNotifications && <li>Browser notifications are enabled</li>}
              {(preferences.email || preferences.phone) && <li>Email/SMS notifications (if contact info provided)</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences; 
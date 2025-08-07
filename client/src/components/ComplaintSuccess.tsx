import React, { useState, useEffect } from 'react';
import { Complaint } from '../../../shared/types/complaint';
import NotificationPreferences from './NotificationPreferences';
import NotificationService, { NotificationPreferencesData } from '../utils/notificationService';
import './ComplaintSuccess.css';

interface ComplaintSuccessProps {
  complaint: Complaint;
  onBackToForm: () => void;
  onViewDashboard: () => void;
}

const ComplaintSuccess: React.FC<ComplaintSuccessProps> = ({ 
  complaint, 
  onBackToForm, 
  onViewDashboard 
}) => {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferencesData>(
    complaint.notificationPreferences || {
      enabled: false,
      browserNotifications: false,
      statusUpdates: true,
      resolutionUpdates: true
    }
  );
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const notificationService = NotificationService.getInstance();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return '🟡';
      case 'in_progress': return '🔵';
      case 'resolved': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'roads': return '🛣️';
      case 'garbage': return '🗑️';
      case 'water': return '💧';
      case 'electricity': return '⚡';
      case 'sewage': return '🚽';
      case 'traffic': return '🚦';
      case 'streetlight': return '💡';
      default: return '📋';
    }
  };

  const handleNotificationUpdate = async () => {
    setIsUpdatingNotifications(true);
    try {
      // In a real application, you would update the complaint's notification preferences
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const copyComplaintId = () => {
    navigator.clipboard.writeText(complaint.id);
    // You could show a toast notification here
  };

  return (
    <div className="complaint-success-container">
      <div className="success-card">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon-large">✅</div>
          <h1>Complaint Submitted Successfully!</h1>
          <p>Your complaint has been received and is being processed</p>
        </div>

        {/* Complaint Summary */}
        <div className="complaint-summary">
          <div className="summary-header">
            <h2>Complaint Details</h2>
            <div className="complaint-id-section">
              <span className="complaint-id-label">Complaint ID:</span>
              <span className="complaint-id">{complaint.id}</span>
              <button 
                onClick={copyComplaintId}
                className="copy-btn"
                title="Copy Complaint ID"
              >
                📋
              </button>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Status</span>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(complaint.status) }}
              >
                {getStatusIcon(complaint.status)} {complaint.status.replace('_', ' ')}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Category</span>
              <span className="summary-value">
                {getCategoryIcon(complaint.category)} {complaint.category}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Priority</span>
              <span className="summary-value priority-high">{complaint.priority.toUpperCase()}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Department</span>
              <span className="summary-value">{complaint.department}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Submitted</span>
              <span className="summary-value">{formatDate(complaint.createdAt)}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Resolution Time</span>
              <span className="summary-value">{complaint.estimatedResolutionTime}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{complaint.description}</p>
          </div>

          <div className="location-section">
            <h3>📍 Location</h3>
            <p>{complaint.location.address}</p>
            <p className="location-details">
              {complaint.location.city}, {complaint.location.state} - {complaint.location.pincode}
            </p>
          </div>

          {complaint.photos.length > 0 && (
            <div className="photos-section">
              <h3>📸 Photos ({complaint.photos.length})</h3>
              <div className="photos-grid">
                {complaint.photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img src={photo} alt={`Complaint photo ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="notification-section">
          <div className="section-header">
            <h2>🔔 Stay Updated</h2>
            <button
              onClick={() => setShowNotificationSettings(!showNotificationSettings)}
              className="toggle-notifications-btn"
            >
              {showNotificationSettings ? 'Hide Settings' : 'Configure Notifications'}
            </button>
          </div>

          {showNotificationSettings && (
            <div className="notification-settings">
              <NotificationPreferences
                onPreferencesChange={setNotificationPreferences}
                initialPreferences={notificationPreferences}
              />
              
              <div className="notification-actions">
                <button
                  onClick={handleNotificationUpdate}
                  disabled={isUpdatingNotifications}
                  className="update-notifications-btn"
                >
                  {isUpdatingNotifications ? 'Updating...' : 'Update Notification Settings'}
                </button>
                
                {updateSuccess && (
                  <div className="update-success">
                    ✅ Notification settings updated successfully!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={onViewDashboard} className="action-btn primary">
            📊 View All Complaints
          </button>
          
          <button onClick={onBackToForm} className="action-btn secondary">
            📝 Submit Another Complaint
          </button>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <h3>💡 What happens next?</h3>
          <ul>
            <li>Your complaint has been assigned to the appropriate department</li>
            <li>You'll receive updates as the status changes</li>
            <li>Estimated resolution time: {complaint.estimatedResolutionTime}</li>
            <li>Keep your complaint ID handy for tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplaintSuccess; 
import React, { useState } from 'react';
import { Complaint } from '../../../shared/types/complaint';
import NotificationService from '../utils/notificationService';
import './ComplaintCard.css';

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusUpdate: () => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onStatusUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const notificationService = NotificationService.getInstance();

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/complaints/${complaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Send browser notification if enabled
      if (complaint.notificationPreferences?.enabled && 
          complaint.notificationPreferences.browserNotifications &&
          notificationService.canSendNotifications()) {
        
        if (newStatus === 'resolved' && complaint.notificationPreferences.resolutionUpdates) {
          await notificationService.sendComplaintResolution(complaint.id);
        } else if (complaint.notificationPreferences.statusUpdates) {
          await notificationService.sendComplaintStatusUpdate(complaint.id, newStatus);
        }
      }

      onStatusUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="complaint-card">
      <div className="card-header">
        <div className="card-title">
          <div className="category-icon">
            {getCategoryIcon(complaint.category)}
          </div>
          <div className="title-content">
            <h4>{complaint.description.substring(0, 50)}...</h4>
            <p className="user-info">by {complaint.user}</p>
          </div>
        </div>
        
        <div className="card-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(complaint.status) }}
          >
            {getStatusIcon(complaint.status)} {complaint.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <div className="meta-item">
            <span className="meta-label">Priority:</span>
            <span 
              className="priority-badge"
              style={{ color: getPriorityColor(complaint.priority) }}
            >
              {complaint.priority.toUpperCase()}
            </span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Department:</span>
            <span className="meta-value">{complaint.department}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Category:</span>
            <span className="meta-value">{complaint.category}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Created:</span>
            <span className="meta-value">{formatDate(complaint.createdAt)}</span>
          </div>
          
          {complaint.notificationPreferences?.enabled && (
            <div className="meta-item">
              <span className="meta-label">Notifications:</span>
              <span className="notification-status">
                🔔 Enabled
                {complaint.notificationPreferences.browserNotifications && (
                  <span className="browser-notification-indicator" title="Browser notifications enabled">
                    🌐
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {complaint.keywords.length > 0 && (
          <div className="keywords-section">
            <span className="keywords-label">Keywords:</span>
            <div className="keywords-list">
              {complaint.keywords.slice(0, 3).map((keyword, index) => (
                <span key={index} className="keyword-tag">{keyword}</span>
              ))}
              {complaint.keywords.length > 3 && (
                <span className="more-keywords">+{complaint.keywords.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {complaint.photos.length > 0 && (
          <div className="photos-section">
            <span className="photos-label">📸 {complaint.photos.length} photo(s)</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="details-btn"
        >
          {showDetails ? '🔽 Hide Details' : '🔼 Show Details'}
        </button>
        
        {complaint.status !== 'resolved' && (
          <div className="status-actions">
            <span className="status-label">Update Status:</span>
            <div className="status-buttons">
              {complaint.status === 'open' && (
                <button
                  onClick={() => updateStatus('in_progress')}
                  disabled={isUpdating}
                  className="status-btn in-progress"
                >
                  🔵 Start Work
                </button>
              )}
              {(complaint.status === 'open' || complaint.status === 'in_progress') && (
                <button
                  onClick={() => updateStatus('resolved')}
                  disabled={isUpdating}
                  className="status-btn resolved"
                >
                  ✅ Mark Resolved
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="card-details">
          <div className="detail-section">
            <h5>📝 Full Description</h5>
            <p>{complaint.description}</p>
          </div>

          <div className="detail-section">
            <h5>📍 Location</h5>
            <p>{complaint.location.address}</p>
            <p className="location-coords">
              {complaint.location.city}, {complaint.location.state} - {complaint.location.pincode}
            </p>
            <p className="location-coords">
              Coordinates: {complaint.location.latitude.toFixed(6)}, {complaint.location.longitude.toFixed(6)}
            </p>
          </div>

          <div className="detail-section">
            <h5>🤖 AI Analysis</h5>
            <div className="ai-analysis-grid">
              <div className="ai-item">
                <span className="ai-label">Confidence:</span>
                <span className="ai-value">{Math.round(complaint.confidence * 100)}%</span>
              </div>
              <div className="ai-item">
                <span className="ai-label">Resolution Time:</span>
                <span className="ai-value">{complaint.estimatedResolutionTime}</span>
              </div>
            </div>
            
            {complaint.suggestions.length > 0 && (
              <div className="suggestions-section">
                <h6>💡 AI Suggestions:</h6>
                <ul className="suggestions-list">
                  {complaint.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {complaint.photos.length > 0 && (
            <div className="detail-section">
              <h5>📸 Photos</h5>
              <div className="photos-grid">
                {complaint.photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img src={photo} alt={`Complaint photo ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h5>📊 Timeline</h5>
            <div className="timeline">
              <div className="timeline-item">
                <span className="timeline-date">{formatDate(complaint.createdAt)}</span>
                <span className="timeline-event">Complaint submitted</span>
              </div>
              <div className="timeline-item">
                <span className="timeline-date">{formatDate(complaint.updatedAt)}</span>
                <span className="timeline-event">Last updated</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard; 
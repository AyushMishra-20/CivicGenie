import React, { useState, useEffect } from 'react';
import { submitComplaint } from '../api/complaints';
import LocationPicker from './LocationPicker';
import PhotoUpload from './PhotoUpload';
import AIAnalysisDisplay from './AIAnalysisDisplay';
import NotificationPreferences from './NotificationPreferences';
import { LocationData } from '../utils/locationService';
import { NotificationPreferencesData } from '../utils/notificationService';
import { Complaint } from '../../../shared/types/complaint';
import pwaService from '../utils/pwaService';
import './ComplaintForm.css';

interface ComplaintFormProps {
  onComplaintSubmitted?: (complaint: Complaint) => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onComplaintSubmitted }) => {
  const [user, setUser] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferencesData>({
    enabled: false,
    browserNotifications: false,
    statusUpdates: true,
    resolutionUpdates: true
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineComplaintId, setOfflineComplaintId] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!location) {
      setError('Please provide location details for your complaint.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isOffline) {
        // Save complaint offline
        const offlineComplaint = {
          title: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
          description,
          category: 'General', // Will be determined when synced
          priority: 'Medium', // Will be determined when synced
          location: {
            address: location.address,
            coordinates: [location.latitude, location.longitude] as [number, number]
          },
          photos
        };

        const complaintId = await pwaService.saveOfflineComplaint(offlineComplaint);
        setOfflineComplaintId(complaintId);
        
        // Show offline success message
        setSuccess(true);
        setAiAnalysis({
          category: 'other',
          priority: 'medium',
          department: 'Will be determined when online',
          estimatedResolutionTime: 'Unknown',
          keywords: [],
          confidence: 0,
          suggestions: ['This complaint will be processed when you are back online']
        });

        if (onComplaintSubmitted) {
          // Create a mock complaint object for offline submissions
          const mockComplaint: Complaint = {
            id: complaintId,
            user,
            description,
            language,
            location,
            photos,
            category: 'other',
            priority: 'medium',
            department: 'Will be determined when online',
            status: 'open',
            estimatedResolutionTime: 'Unknown',
            keywords: [],
            confidence: 0,
            suggestions: ['This complaint will be processed when you are back online'],
            notificationPreferences: notificationPreferences.enabled ? notificationPreferences : {
              enabled: false,
              browserNotifications: false,
              statusUpdates: true,
              resolutionUpdates: true
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          onComplaintSubmitted(mockComplaint);
        }
      } else {
        // Submit complaint online
        const response = await submitComplaint({ 
          user, 
          description, 
          language, 
          location, 
          photos,
          notificationPreferences: notificationPreferences.enabled ? notificationPreferences : undefined
        });
        setSuccess(true);
        setAiAnalysis({
          category: response.category,
          priority: response.priority,
          department: response.department,
          estimatedResolutionTime: response.estimatedResolutionTime,
          keywords: response.keywords,
          confidence: response.confidence,
          suggestions: response.suggestions
        });

        if (onComplaintSubmitted) {
          onComplaintSubmitted(response);
        } else {
          // Fallback: clear form and show success message
          setUser('');
          setDescription('');
          setLanguage('en');
          setLocation(null);
          setPhotos([]);
          setNotificationPreferences({
            enabled: false,
            browserNotifications: false,
            statusUpdates: true,
            resolutionUpdates: true
          });
          
          // Clear success message after 10 seconds
          setTimeout(() => {
            setSuccess(false);
            setAiAnalysis(null);
          }, 10000);
        }
      }
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { value: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳' }
  ];

  return (
    <div className="complaint-form-container">
      {isOffline && (
        <div className="offline-banner">
          <span>📶 You're offline - complaints will be saved locally and synced when you're back online</span>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <h3>✅ Complaint Submitted Successfully!</h3>
          {isOffline ? (
            <p>Your complaint has been saved offline and will be processed when you're back online.</p>
          ) : (
            <p>Your complaint has been submitted and is being processed by our AI system.</p>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-group">
          <label htmlFor="user">Your Name *</label>
          <input
            type="text"
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
            placeholder="Enter your full name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
            className="form-select"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.flag} {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Complaint Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the issue in detail..."
            rows={4}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label>Location *</label>
          <LocationPicker
            onLocationChange={setLocation}
            initialLocation={location}
          />
        </div>

        <div className="form-group">
          <label>Photos (Optional)</label>
          <PhotoUpload
            onPhotosChange={setPhotos}
            initialPhotos={photos}
          />
        </div>

        <div className="form-group">
          <NotificationPreferences
            onPreferencesChange={setNotificationPreferences}
            initialPreferences={notificationPreferences}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : isOffline ? 'Save Offline' : 'Submit Complaint'}
        </button>
      </form>

      {aiAnalysis && (
        <div className="ai-analysis-section">
          <h3>🤖 AI Analysis</h3>
          <AIAnalysisDisplay analysis={aiAnalysis} />
        </div>
      )}
    </div>
  );
};

export default ComplaintForm; 
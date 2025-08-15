import React, { useState, useEffect, useMemo } from 'react';
import { Send, RotateCcw, LayoutDashboard, FileText, Sparkles, MessageCircle, Clock, CheckCircle, AlertCircle, Camera, MapPin, Bell, LogOut, Settings, User, Mail, Phone, MapPin as MapPinIcon, Edit3, Save, X, BarChart3, ClipboardList, Users, Home } from 'lucide-react';
import SignupForm from './components/Auth/SignupForm';
import LoginForm from './components/Auth/LoginForm';

// Import types
interface Complaint {
  _id: string;
  text: string;
  status: string;
  createdAt: string;
  user?: string;
  category?: string;
  priority?: string;
  location?: { latitude: number; longitude: number; address: string };
  images?: string[];
}

interface User {
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'administrator' | 'department_staff';
  location: { latitude: number; longitude: number; address: string };
  profileImage?: string;
  preferences?: {
    notifications: boolean;
    locationSharing: boolean;
    language: string;
  };
}

// The base URL for your backend API.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/complaints';

// PWA: Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.log('Service Worker registration failed:', error);
    });
  });
}

// Main App component
const App = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'main'>('signup');
  const [user, setUser] = useState<User | null>(null);
  const [complaintText, setComplaintText] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info'; timestamp: Date }>>([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    enabled: false,
    statusUpdates: true,
    resolutionUpdates: true
  });
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showComplaintDetails, setShowComplaintDetails] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    autoAssignment: false,
    emailNotifications: true,
    autoEscalation: false,
    performanceTracking: true
  });

  // Function to fetch complaints from the Node.js backend
  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setComplaints(data);
    } catch (e) {
      console.error("Error fetching complaints:", e);
      setError("Failed to fetch complaints. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch complaints when the component mounts
  useEffect(() => {
    if (user) {
    fetchComplaints();
    }
  }, [user]);

  // Function to handle text input
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComplaintText(event.target.value);
  };

  // Function to view complaint details
  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintDetails(true);
  };

  // Function to update complaint status (Admin only)
  const handleUpdateStatus = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowStatusUpdate(true);
  };

  // Function to assign complaint to department (Staff only)
  const handleAssignTask = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowAssignmentModal(true);
  };

  // Function to close modals
  const closeModals = () => {
    setShowComplaintDetails(false);
    setShowStatusUpdate(false);
    setShowAssignmentModal(false);
    setShowBulkUpdateModal(false);
    setShowExportModal(false);
    setShowDepartmentModal(false);
    setShowPriorityModal(false);
    setSelectedComplaint(null);
  };

  // Admin functions
  const handleBulkStatusUpdate = () => {
    setShowBulkUpdateModal(true);
  };

  const handleExportData = () => {
    setShowExportModal(true);
  };

  const handleDepartmentAssignment = () => {
    setShowDepartmentModal(true);
  };

  const handlePriorityManagement = () => {
    setShowPriorityModal(true);
  };

  const handleAdminSettingChange = (setting: string, value: boolean) => {
    setAdminSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    addNotification(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}!`, 'success');
  };



  // Function to handle quick action buttons
  const handleQuickAction = (template: string) => {
    setComplaintText(template);
  };

  // Function to handle image upload from file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newImages.push(event.target?.result as string);
          if (newImages.length === files.length) {
            setSelectedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Function to handle camera capture
  const handleCameraCapture = () => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      addNotification('Camera access is not supported in this browser.', 'error');
      return;
    }

    // Request camera permission and access
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', // Use back camera
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      } 
    })
    .then((stream) => {
      // Create video element to capture from camera
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.zIndex = '9999';
      video.style.objectFit = 'cover';

      // Create canvas for capturing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1920;
      canvas.height = 1080;

      // Create capture button
      const captureBtn = document.createElement('button');
      captureBtn.textContent = '📸 Capture Photo';
      captureBtn.style.position = 'fixed';
      captureBtn.style.bottom = '20px';
      captureBtn.style.left = '50%';
      captureBtn.style.transform = 'translateX(-50%)';
      captureBtn.style.zIndex = '10000';
      captureBtn.style.padding = '12px 24px';
      captureBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
      captureBtn.style.color = '#000';
      captureBtn.style.border = 'none';
      captureBtn.style.borderRadius = '12px';
      captureBtn.style.fontWeight = '600';
      captureBtn.style.cursor = 'pointer';

      // Create cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '❌ Cancel';
      cancelBtn.style.position = 'fixed';
      cancelBtn.style.top = '20px';
      cancelBtn.style.right = '20px';
      cancelBtn.style.zIndex = '10000';
      cancelBtn.style.padding = '8px 16px';
      cancelBtn.style.background = 'rgba(255, 71, 87, 0.9)';
      cancelBtn.style.color = 'white';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '8px';
      cancelBtn.style.cursor = 'pointer';

      // Add elements to page
      document.body.appendChild(video);
      document.body.appendChild(captureBtn);
      document.body.appendChild(cancelBtn);

      // Handle capture
      captureBtn.onclick = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (event) => {
                setSelectedImages(prev => [...prev, event.target?.result as string]);
                addNotification('Photo captured successfully!', 'success');
              };
              reader.readAsDataURL(blob);
            }
          }, 'image/jpeg', 0.8);
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
        document.body.removeChild(captureBtn);
        document.body.removeChild(cancelBtn);
      };

      // Handle cancel
      cancelBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
        document.body.removeChild(captureBtn);
        document.body.removeChild(cancelBtn);
      };
    })
    .catch((error) => {
      console.error('Camera access error:', error);
      if (error.name === 'NotAllowedError') {
        addNotification('Camera permission denied. Please allow camera access in your browser settings.', 'error');
      } else if (error.name === 'NotFoundError') {
        addNotification('No camera found on this device.', 'error');
      } else {
        addNotification('Failed to access camera. Please try again.', 'error');
      }
    });
  };

  // Function to remove image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Function to get user location with high accuracy
  const getUserLocation = () => {
    if (navigator.geolocation) {
      addNotification('Getting your precise location...', 'info');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Check accuracy - if it's too low, warn the user
          if (accuracy > 100) {
            addNotification('Location accuracy is low. Consider moving to an open area for better precision.', 'error');
          }
          
          // Try to get address from coordinates
          getAddressFromCoordinates(latitude, longitude)
            .then(address => {
              setUserLocation({
                latitude,
                longitude,
                address: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              });
              addNotification(`Location shared successfully! Accuracy: ${Math.round(accuracy)}m`, 'success');
            })
            .catch(() => {
              setUserLocation({
                latitude,
                longitude,
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              });
              addNotification(`Location shared successfully! Accuracy: ${Math.round(accuracy)}m`, 'success');
            });
        },
        (error) => {
          console.error('Error getting location:', error);
          if (error.code === 1) {
            addNotification('Location permission denied. Please enable location access in your browser settings.', 'error');
          } else if (error.code === 2) {
            addNotification('Location unavailable. Please try again or enter location manually.', 'error');
          } else if (error.code === 3) {
            addNotification('Location request timed out. Please try again or enter location manually.', 'error');
          } else {
            addNotification('Failed to get location. Please try again or enter location manually.', 'error');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased timeout for better accuracy
          maximumAge: 0 // Always get fresh location
        }
      );
    } else {
      addNotification('Geolocation is not supported by this browser.', 'error');
    }
  };

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          // Extract the most relevant part of the address
          const addressParts = data.display_name.split(', ');
          const relevantParts = addressParts.slice(0, 3).join(', ');
          return relevantParts;
        }
      }
      return '';
    } catch (error) {
      console.error('Error getting address:', error);
      return '';
    }
  };

  // Function to handle manual location input
  const handleManualLocation = (address: string) => {
    setUserLocation({
      latitude: 0,
      longitude: 0,
      address: address
    });
    addNotification('Location updated successfully!', 'success');
  };

  // Function to add notification
  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  // Function to handle complaint submission
  const handleSubmit = async () => {
    if (complaintText.trim() === '') {
      addNotification('Please enter a complaint before submitting.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: complaintText,
          location: userLocation || null,
          images: selectedImages,
          notificationPreferences: notificationPreferences
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const complaintData = await response.json();
      setSubmittedComplaint(complaintData);
      setComplaintText('');
      setSelectedImages([]);
      fetchComplaints();

    } catch (e) {
      console.error("Error submitting complaint:", e);
      addNotification('Failed to submit complaint. Please ensure the backend is running.', 'error');
    }
  };

  // Function to reset the form
  const handleReset = () => {
    setComplaintText('');
    setSelectedImages([]);
  };

  // Function to handle signup
  const handleSignup = async (userData: any) => {
    setAuthLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          role: userData.role || 'citizen'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Convert backend user format to frontend format
      const newUser: User = {
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        role: data.user.role,
        location: { latitude: 0, longitude: 0, address: 'Unknown' },
        preferences: {
          notifications: true,
          locationSharing: true,
          language: 'English'
        }
      };

      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      
      setUser(newUser);
      setAuthView('main');
      addNotification(`Account created successfully as ${data.user.role}!`, 'success');
    } catch (error) {
      console.error('Registration error:', error);
      addNotification(error instanceof Error ? error.message : 'Registration failed. Please try again.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Function to handle login
  const handleLogin = async (credentials: any) => {
    setAuthLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          role: credentials.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Convert backend user format to frontend format
      const user: User = {
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        role: data.user.role,
        location: { latitude: 0, longitude: 0, address: 'Unknown' },
        preferences: {
          notifications: true,
          locationSharing: true,
          language: 'English'
        }
      };

      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      
      setUser(user);
      setAuthView('main');
      addNotification(`Logged in successfully as ${data.user.role}!`, 'success');
    } catch (error) {
      console.error('Login error:', error);
      console.log('Error details:', error);
      addNotification(error instanceof Error ? error.message : 'Login failed. Please try again.', 'error');
      // Don't redirect on error - stay on login page
      return;
    } finally {
      setAuthLoading(false);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    setUser(null);
    setAuthView('login');
    setComplaints([]);
    setShowSettings(false);
    addNotification('Logged out successfully!', 'info');
  };

  // Function to update user profile
  const updateUserProfile = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
      addNotification('Profile updated successfully!', 'success');
    }
  };

  // Function to update user preferences
  const updateUserPreferences = (preferences: Partial<User['preferences']>) => {
    if (user && user.preferences) {
      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, ...preferences }
      };
      setUser(updatedUser);
      addNotification('Preferences updated successfully!', 'success');
    }
  };

  // Get character counter class
  const getCharCounterClass = () => {
    const length = complaintText.length;
    if (length > 800) return 'danger';
    if (length > 600) return 'warning';
    return '';
  };

  // Memoize the ComplaintSubmission component
  const ComplaintSubmission = useMemo(() => (
    <>
             <div className="nav-header">
         <div className="nav-actions">
           <button 
             onClick={() => setView('dashboard')} 
             className="nav-button"
           >
             <LayoutDashboard />
          Dashboard
        </button>
           {user?.role === 'administrator' && (
             <button 
               onClick={() => setView('admin')} 
               className="nav-button"
             >
               <Settings />
               Admin Panel
             </button>
           )}
           {user?.role === 'department_staff' && (
             <button 
               onClick={() => setView('staff')} 
               className="nav-button"
             >
               <Settings />
               Staff Panel
             </button>
           )}
           <button 
             onClick={() => setShowSettings(true)} 
             className="nav-button"
           >
             <Settings />
        </button>
      </div>
       </div>
       
       <div className="page-title">
         <h2 className="nav-title">
           <MessageCircle />
           New Complaint
         </h2>
       </div>
      
      <div className="textarea-container">
        <label className="textarea-label">
          <AlertCircle />
          Describe Your Issue
        </label>
        
        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => handleQuickAction("Road condition issue: ")}
          >
            🛣️ Road Issue
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => handleQuickAction("Garbage collection problem: ")}
          >
            🗑️ Garbage
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => handleQuickAction("Water supply issue: ")}
          >
            💧 Water
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => handleQuickAction("Street light not working: ")}
          >
            💡 Street Light
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => handleQuickAction("Traffic signal problem: ")}
          >
            🚦 Traffic
        </button>
      </div>
        
        <textarea
          className="textarea"
          placeholder="Start typing your complaint here... Be specific about the location, issue details, and how long it has been affecting you. You can write in English, Hindi, or Marathi."
          value={complaintText}
          onChange={handleTextChange}
        ></textarea>
        
        <div className={`char-counter ${getCharCounterClass()}`}>
          {complaintText.length}/1000
      </div>
        
        <div className="textarea-hint">
          💡 Tip: Include specific details like location, time, and impact to help us resolve your issue faster.
        </div>
      </div>

             {/* Optional Location Section */}
       <div className="optional-section">
         <label className="section-label">
           <MapPin className="section-icon" />
           Location (Optional)
         </label>
         <div className="location-options">
        <button
             onClick={getUserLocation}
             className={`optional-button ${userLocation ? 'success' : ''}`}
           >
             📍 Use Live Location
        </button>
           <button
             onClick={() => setShowManualLocation(!showManualLocation)}
             className="optional-button"
           >
             ✏️ Enter Manually
           </button>
         </div>
         
         {showManualLocation && (
           <div className="manual-location-input">
             <input
               type="text"
               placeholder="Enter your location (e.g., Street name, City, Landmark)"
               value={manualLocation}
               onChange={(e) => setManualLocation(e.target.value)}
               className="location-input"
             />
             <button
               onClick={() => {
                 if (manualLocation.trim()) {
                   handleManualLocation(manualLocation.trim());
                   setManualLocation('');
                   setShowManualLocation(false);
                 }
               }}
               className="location-save-button"
               disabled={!manualLocation.trim()}
             >
               Save
             </button>
           </div>
         )}
         
         {userLocation && (
           <div className="location-display">
             <span className="location-text">{userLocation.address}</span>
             <button
               onClick={() => setUserLocation(null)}
               className="location-clear-button"
             >
               ×
             </button>
           </div>
         )}
       </div>

       {/* Optional Image Upload Section */}
       <div className="optional-section">
         <label className="section-label">
           <Camera className="section-icon" />
           Photos (Optional)
         </label>
         <div className="photo-options">
           <button
             onClick={handleCameraCapture}
             className="optional-button"
           >
             📸 Take Photo
           </button>
           <label htmlFor="complaint-images" className="optional-button">
             📁 Choose from Gallery
           </label>
           <input
             type="file"
             accept="image/*"
             multiple
             onChange={handleImageUpload}
             className="image-input"
             id="complaint-images"
             style={{ display: 'none' }}
           />
         </div>
         {selectedImages.length > 0 && (
           <div className="image-preview-grid">
             {selectedImages.map((image, index) => (
               <div key={index} className="image-preview-item">
                 <img src={image} alt={`Preview ${index + 1}`} />
                 <button
                   onClick={() => removeImage(index)}
                   className="remove-image-button"
                 >
                   ×
                 </button>
               </div>
             ))}
           </div>
         )}
       </div>

       {/* Notification Preferences Section */}
       <div className="optional-section">
         <label className="section-label">
           <Bell className="section-icon" />
           Notification Preferences (Optional)
         </label>
         <div className="notification-options">
           <label className="notification-toggle">
             <input
               type="checkbox"
               checked={notificationPreferences.enabled}
               onChange={(e) => setNotificationPreferences(prev => ({
                 ...prev,
                 enabled: e.target.checked
               }))}
               className="notification-checkbox"
             />
             <span className="notification-label">
               Enable notifications to track complaint status
             </span>
           </label>
           
           {notificationPreferences.enabled && (
             <div className="notification-details">
               <label className="notification-option">
                 <input
                   type="checkbox"
                   checked={notificationPreferences.statusUpdates}
                   onChange={(e) => setNotificationPreferences(prev => ({
                     ...prev,
                     statusUpdates: e.target.checked
                   }))}
                   className="notification-checkbox"
                 />
                 <span>Status updates</span>
               </label>
               <label className="notification-option">
                 <input
                   type="checkbox"
                   checked={notificationPreferences.resolutionUpdates}
                   onChange={(e) => setNotificationPreferences(prev => ({
                     ...prev,
                     resolutionUpdates: e.target.checked
                   }))}
                   className="notification-checkbox"
                 />
                 <span>Resolution updates</span>
               </label>
             </div>
           )}
         </div>
       </div>
      
             <div className="button-group">
        <button
          onClick={handleSubmit}
           className="button button-primary"
           disabled={complaintText.trim() === ''}
        >
           <Send />
          Submit Complaint
        </button>
         
        <button
          onClick={handleReset}
           className="button button-tertiary"
        >
           <RotateCcw />
           Clear Form
        </button>
      </div>
    </>
     ), [complaintText, userLocation, selectedImages, notificationPreferences, user, setView, setShowSettings, handleLogout, handleQuickAction, handleTextChange, handleImageUpload, handleCameraCapture, handleManualLocation, handleSubmit, handleReset, getUserLocation, setManualLocation, setUserLocation, removeImage, showManualLocation, manualLocation]);

  // Memoize the ComplaintSuccess component
  const ComplaintSuccess = useMemo(() => (
    <>
      <div className="nav-header">
        <div className="nav-actions">
          <button 
            onClick={() => setView('dashboard')} 
            className="nav-button"
          >
            <LayoutDashboard />
            Dashboard
          </button>
          <button 
            onClick={() => setView('submit')} 
            className="nav-button"
          >
            <FileText />
          New Complaint
        </button>
          <button 
            onClick={() => setShowSettings(true)} 
            className="nav-button"
          >
            <Settings />
        </button>
      </div>
      </div>
      
      <div className="success-container">
        <div className="success-icon">
          <CheckCircle />
        </div>
        <h2 className="success-title">Complaint Submitted Successfully!</h2>
        <p className="success-subtitle">Your complaint has been received and is being processed.</p>
        
        {submittedComplaint && (
          <div className="complaint-details">
            <div className="complaint-id-section">
              <h3>Complaint ID: {submittedComplaint._id.slice(-8)}</h3>
              <div className="status-badge success">
                <CheckCircle className="status-icon" />
                {submittedComplaint.status}
              </div>
            </div>
            
            <div className="complaint-content">
                              <p><strong>Description:</strong> {submittedComplaint.text || 'No description available'}</p>
              <p><strong>Submitted:</strong> {new Date(submittedComplaint.createdAt).toLocaleString()}</p>
              {submittedComplaint.location && (
                <p><strong>Location:</strong> {submittedComplaint.location.address}</p>
              )}
            </div>
            
            <div className="next-steps">
              <h4>What happens next?</h4>
              <ul>
                <li>Your complaint will be reviewed by our team</li>
                <li>You'll receive updates on the status</li>
                <li>We'll notify you when it's resolved</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="success-actions">
          <button 
            onClick={() => {
              setSubmittedComplaint(null);
              setView('dashboard');
            }}
            className="button button-primary"
          >
            View All Complaints
          </button>
          <button 
            onClick={() => {
              setSubmittedComplaint(null);
              setView('submit');
            }}
            className="button button-secondary"
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    </>
     ), [submittedComplaint, setView, setShowSettings]);

  // Memoize the Dashboard component
  const Dashboard = useMemo(() => (
    <>
      <div className="nav-header">
        <h2 className="nav-title">
          <LayoutDashboard />
          {user?.role === 'administrator' ? 'Admin Dashboard' : 
           user?.role === 'department_staff' ? 'Staff Dashboard' : 
           'Complaint Dashboard'}
        </h2>
                 <div className="nav-actions">
           {user?.role === 'citizen' && (
             <button 
               onClick={() => setView('submit')} 
               className="nav-button"
             >
               <FileText />
            New Complaint
          </button>
           )}
           {user?.role === 'administrator' && (
             <>
               <button 
                 onClick={() => setView('admin')} 
                 className="nav-button"
               >
                 <Settings />
                 Admin Panel
               </button>
               <button 
                 onClick={() => setView('analytics')} 
                 className="nav-button"
               >
                 <BarChart3 />
                 Analytics
               </button>
             </>
           )}
           {user?.role === 'department_staff' && (
             <>
               <button 
                 onClick={() => setView('staff')} 
                 className="nav-button"
               >
                 <Settings />
                 Staff Panel
               </button>
               <button 
                 onClick={() => setView('assigned')} 
                 className="nav-button"
               >
                 <ClipboardList />
                 Assigned Tasks
               </button>
             </>
           )}
           <button 
             onClick={() => setShowSettings(true)} 
             className="nav-button"
           >
             <Settings />
           </button>
         </div>
      </div>
      
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading complaints...</span>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
      </div>
      )}
      
      {!loading && !error && complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Sparkles />
          </div>
          <p className="empty-title">No complaints submitted yet</p>
          <p className="empty-subtitle">Be the first to raise a civic issue!</p>
        </div>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <div key={complaint._id} className="complaint-card">
              <div className="complaint-header">
                <div className="complaint-main">
                  <div className="complaint-text">{complaint.text || 'No description available'}</div>
                  <div className="complaint-user">
                    <User className="user-icon" />
                    <span>{complaint.user || 'Anonymous'}</span>
                  </div>
                </div>
                <div className="complaint-status">
                  <CheckCircle className="status-icon" />
                  <span className="status-badge">{complaint.status}</span>
                </div>
              </div>
              
              <div className="complaint-details">
                <div className="complaint-meta">
                  <div className="meta-item">
                    <Clock className="meta-icon" />
                    <span>Submitted: {new Date(complaint.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">ID:</span>
                    <span className="meta-value">{complaint._id.slice(-8)}</span>
                  </div>
                  {complaint.category && (
                    <div className="meta-item">
                      <span className="meta-label">Category:</span>
                      <span className="meta-value">{complaint.category}</span>
                    </div>
                  )}
                  {complaint.priority && (
                    <div className="meta-item">
                      <span className="meta-label">Priority:</span>
                      <span className={`priority-badge priority-${complaint.priority}`}>
                        {complaint.priority}
                </span>
                    </div>
                  )}
                </div>
                
                {complaint.location && complaint.location.address && (
                  <div className="complaint-location">
                    <MapPin className="location-icon" />
                    <span>{complaint.location.address}</span>
                  </div>
                )}
                
                {complaint.images && complaint.images.length > 0 && (
                  <div className="complaint-images">
                    <span className="images-label">📷 {complaint.images.length} photo(s) attached</span>
                  </div>
                )}
              </div>
              
              <div className="complaint-actions">
                <button 
                  className="action-button"
                  onClick={() => handleViewDetails(complaint)}
                >
                  View Details
                </button>
                {user?.role === 'administrator' && (
                  <button 
                    className="action-button admin-action"
                    onClick={() => handleUpdateStatus(complaint)}
                  >
                    Update Status
                  </button>
                )}
                {user?.role === 'department_staff' && (
                  <button 
                    className="action-button staff-action"
                    onClick={() => handleAssignTask(complaint)}
                  >
                    Assign Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
     ), [loading, error, complaints, user, setView, setShowSettings, handleViewDetails, handleUpdateStatus, handleAssignTask]);

     // Settings state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSave = (field: string) => {
    if (user) {
      const updatedData: any = {};
      updatedData[field] = editValue;
      updateUserProfile(updatedData);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Memoize the SettingsPanel component
  const SettingsPanel = useMemo(() => {

  return (
       <>
                   <div className="nav-header">
            <div className="settings-header">
              <div className="settings-header-left">
                <h2 className="nav-title">
                  <Settings />
                  Settings
                </h2>
                <p className="settings-subtitle">Manage your account preferences and profile</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="settings-close-btn"
              >
                <X />
              </button>
            </div>
          </div>

         <div className="settings-container">
           {/* Profile Section */}
           <div className="settings-section">
             <h3 className="settings-section-title">
               <User />
               Profile Information
             </h3>
             
             <div className="settings-item">
               <div className="settings-item-label">
                 <User />
                 Full Name
               </div>
               <div className="settings-item-content">
                 {editingField === 'name' ? (
                   <div className="edit-mode">
                     <input
                       type="text"
                       value={editValue}
                       onChange={(e) => setEditValue(e.target.value)}
                       className="settings-input"
                       placeholder="Enter your full name"
                     />
                     <button onClick={() => handleSave('name')} className="settings-save-btn">
                       <Save />
                     </button>
                     <button onClick={handleCancel} className="settings-cancel-btn">
                       <X />
                     </button>
                   </div>
                 ) : (
                   <div className="display-mode">
                     <span className="settings-value">{user?.name || 'Not set'}</span>
                     <button onClick={() => handleEdit('name', user?.name || '')} className="settings-edit-btn">
                       <Edit3 />
                     </button>
                   </div>
                 )}
               </div>
             </div>

             <div className="settings-item">
               <div className="settings-item-label">
                 <Mail />
                 Email Address
               </div>
               <div className="settings-item-content">
                 {editingField === 'email' ? (
                   <div className="edit-mode">
                     <input
                       type="email"
                       value={editValue}
                       onChange={(e) => setEditValue(e.target.value)}
                       className="settings-input"
                       placeholder="Enter your email"
                     />
                     <button onClick={() => handleSave('email')} className="settings-save-btn">
                       <Save />
                     </button>
                     <button onClick={handleCancel} className="settings-cancel-btn">
                       <X />
                     </button>
                   </div>
                 ) : (
                   <div className="display-mode">
                     <span className="settings-value">{user?.email || 'Not set'}</span>
                     <button onClick={() => handleEdit('email', user?.email || '')} className="settings-edit-btn">
                       <Edit3 />
                     </button>
                   </div>
                 )}
               </div>
             </div>

             <div className="settings-item">
               <div className="settings-item-label">
                 <Phone />
                 Phone Number
               </div>
               <div className="settings-item-content">
                 {editingField === 'phone' ? (
                   <div className="edit-mode">
                     <input
                       type="tel"
                       value={editValue}
                       onChange={(e) => setEditValue(e.target.value)}
                       className="settings-input"
                       placeholder="Enter your phone number"
                     />
                     <button onClick={() => handleSave('phone')} className="settings-save-btn">
                       <Save />
                     </button>
                     <button onClick={handleCancel} className="settings-cancel-btn">
                       <X />
                     </button>
                   </div>
                 ) : (
                   <div className="display-mode">
                     <span className="settings-value">{user?.phone || 'Not set'}</span>
                     <button onClick={() => handleEdit('phone', user?.phone || '')} className="settings-edit-btn">
                       <Edit3 />
                     </button>
                   </div>
                 )}
               </div>
             </div>

             <div className="settings-item">
               <div className="settings-item-label">
                 <MapPinIcon />
                 Default Location
               </div>
               <div className="settings-item-content">
                 <div className="display-mode">
                   <span className="settings-value">{user?.location?.address || 'Not set'}</span>
                   <button onClick={() => getUserLocation()} className="settings-edit-btn">
                     <MapPin />
                   </button>
                 </div>
               </div>
             </div>
           </div>

           {/* Preferences Section */}
           <div className="settings-section">
             <h3 className="settings-section-title">
               <Settings />
               Preferences
             </h3>
             
             <div className="settings-item">
               <div className="settings-item-label">
                 <Bell />
                 Notifications
               </div>
               <div className="settings-item-content">
                 <div className="toggle-switch">
                   <input
                     type="checkbox"
                     id="notifications"
                     checked={user?.preferences?.notifications || false}
                     onChange={(e) => updateUserPreferences({ notifications: e.target.checked })}
                   />
                   <label htmlFor="notifications" className="toggle-label"></label>
                 </div>
               </div>
             </div>

             <div className="settings-item">
               <div className="settings-item-label">
                 <MapPin />
                 Location Sharing
               </div>
               <div className="settings-item-content">
                 <div className="toggle-switch">
                   <input
                     type="checkbox"
                     id="locationSharing"
                     checked={user?.preferences?.locationSharing || false}
                     onChange={(e) => updateUserPreferences({ locationSharing: e.target.checked })}
                   />
                   <label htmlFor="locationSharing" className="toggle-label"></label>
                 </div>
               </div>
             </div>

             <div className="settings-item">
               <div className="settings-item-label">
                 🌐 Language
               </div>
               <div className="settings-item-content">
                 <select
                   value={user?.preferences?.language || 'English'}
                   onChange={(e) => updateUserPreferences({ language: e.target.value })}
                   className="settings-select"
                 >
                   <option value="English">English</option>
                   <option value="Hindi">Hindi</option>
                   <option value="Marathi">Marathi</option>
                 </select>
               </div>
             </div>
           </div>

           {/* Account Actions */}
           <div className="settings-section">
             <h3 className="settings-section-title">
               ⚙️ Account Actions
             </h3>
             
             <div className="settings-actions">
               <button onClick={handleLogout} className="settings-action-btn settings-action-btn-danger">
                 <LogOut />
                 Logout
               </button>
             </div>
           </div>
         </div>
    </>
  );
   }, [user, updateUserProfile, updateUserPreferences, getUserLocation, handleLogout, editingField, editValue, handleEdit, handleSave, handleCancel]);

   // Complaint Details Modal
   const ComplaintDetailsModal = useMemo(() => (
     selectedComplaint && showComplaintDetails ? (
       <div className="modal-overlay" onClick={closeModals}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <div className="modal-header">
             <h3>Complaint Details</h3>
             <button onClick={closeModals} className="modal-close">
               <X />
             </button>
           </div>
           <div className="modal-body">
             <div className="detail-section">
               <h4>Description</h4>
               <p>{selectedComplaint.text || 'No description available'}</p>
             </div>
             <div className="detail-section">
               <h4>Status</h4>
               <span className={`status-badge status-${selectedComplaint.status.toLowerCase()}`}>
                 {selectedComplaint.status}
               </span>
             </div>
             <div className="detail-section">
               <h4>Submitted</h4>
               <p>{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
             </div>
             <div className="detail-section">
               <h4>Complaint ID</h4>
               <p>{selectedComplaint._id}</p>
             </div>
             {selectedComplaint.category && (
               <div className="detail-section">
                 <h4>Category</h4>
                 <p>{selectedComplaint.category}</p>
               </div>
             )}
             {selectedComplaint.priority && (
               <div className="detail-section">
                 <h4>Priority</h4>
                 <span className={`priority-badge priority-${selectedComplaint.priority}`}>
                   {selectedComplaint.priority}
                 </span>
               </div>
             )}
             {selectedComplaint.location && (
               <div className="detail-section">
                 <h4>Location</h4>
                 <p>{selectedComplaint.location.address}</p>
               </div>
             )}
             {selectedComplaint.images && selectedComplaint.images.length > 0 && (
               <div className="detail-section">
                 <h4>Attached Images</h4>
                 <div className="image-grid">
                   {selectedComplaint.images.map((image, index) => (
                     <img key={index} src={image} alt={`Complaint image ${index + 1}`} />
                   ))}
                 </div>
               </div>
             )}
           </div>
           <div className="modal-footer">
             <button onClick={closeModals} className="button button-secondary">
               Close
             </button>
           </div>
         </div>
       </div>
     ) : null
   ), [selectedComplaint, showComplaintDetails, closeModals]);

   // Status Update Modal (Admin only)
   const StatusUpdateModal = useMemo(() => (
     selectedComplaint && showStatusUpdate ? (
       <div className="modal-overlay" onClick={closeModals}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <div className="modal-header">
             <h3>Update Complaint Status</h3>
             <button onClick={closeModals} className="modal-close">
               <X />
             </button>
           </div>
           <div className="modal-body">
             <div className="detail-section">
               <h4>Current Status</h4>
               <span className={`status-badge status-${selectedComplaint.status.toLowerCase()}`}>
                 {selectedComplaint.status}
               </span>
             </div>
             <div className="detail-section">
               <h4>Complaint</h4>
               <p>{selectedComplaint.text || 'No description available'}</p>
             </div>
             <div className="form-group">
               <label>New Status</label>
               <select className="form-input" defaultValue={selectedComplaint.status}>
                 <option value="pending">Pending</option>
                 <option value="in_progress">In Progress</option>
                 <option value="under_review">Under Review</option>
                 <option value="resolved">Resolved</option>
                 <option value="closed">Closed</option>
               </select>
             </div>
             <div className="form-group">
               <label>Priority</label>
               <select className="form-input" defaultValue={selectedComplaint.priority || 'medium'}>
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
                 <option value="urgent">Urgent</option>
               </select>
             </div>
             <div className="form-group">
               <label>Admin Notes (Optional)</label>
               <textarea 
                 className="form-input" 
                 placeholder="Add any notes about this complaint..."
                 rows={3}
               />
             </div>
           </div>
           <div className="modal-footer">
             <button onClick={closeModals} className="button button-secondary">
               Cancel
             </button>
             <button 
               onClick={() => {
                 addNotification('Status updated successfully!', 'success');
                 closeModals();
               }} 
               className="button button-primary"
             >
               Update Status
             </button>
           </div>
         </div>
       </div>
     ) : null
   ), [selectedComplaint, showStatusUpdate, closeModals, addNotification]);

   // Assignment Modal (Staff only)
   const AssignmentModal = useMemo(() => (
     selectedComplaint && showAssignmentModal ? (
       <div className="modal-overlay" onClick={closeModals}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <div className="modal-header">
             <h3>Assign Complaint</h3>
             <button onClick={closeModals} className="modal-close">
               <X />
             </button>
           </div>
           <div className="modal-body">
             <div className="detail-section">
               <h4>Complaint</h4>
               <p>{selectedComplaint.text || 'No description available'}</p>
             </div>
             <div className="detail-section">
               <h4>Current Status</h4>
               <span className={`status-badge status-${selectedComplaint.status.toLowerCase()}`}>
                 {selectedComplaint.status}
               </span>
             </div>
             <div className="form-group">
               <label>Assign to Department</label>
               <select className="form-input">
                 <option value="">Select Department</option>
                 <option value="public_works">Public Works</option>
                 <option value="sanitation">Sanitation</option>
                 <option value="traffic">Traffic Management</option>
                 <option value="parks">Parks & Recreation</option>
                 <option value="utilities">Utilities</option>
                 <option value="security">Security</option>
               </select>
             </div>
             <div className="form-group">
               <label>Assigned Staff Member</label>
               <select className="form-input">
                 <option value="">Select Staff Member</option>
                 <option value="staff1">John Smith - Public Works</option>
                 <option value="staff2">Sarah Johnson - Sanitation</option>
                 <option value="staff3">Mike Davis - Traffic</option>
                 <option value="staff4">Lisa Wilson - Parks</option>
               </select>
             </div>
             <div className="form-group">
               <label>Estimated Resolution Time</label>
               <select className="form-input">
                 <option value="1_day">1 Day</option>
                 <option value="3_days">3 Days</option>
                 <option value="1_week">1 Week</option>
                 <option value="2_weeks">2 Weeks</option>
                 <option value="1_month">1 Month</option>
               </select>
             </div>
             <div className="form-group">
               <label>Assignment Notes</label>
               <textarea 
                 className="form-input" 
                 placeholder="Add any notes about this assignment..."
                 rows={3}
               />
             </div>
           </div>
           <div className="modal-footer">
             <button onClick={closeModals} className="button button-secondary">
               Cancel
             </button>
             <button 
               onClick={() => {
                 addNotification('Complaint assigned successfully!', 'success');
                 closeModals();
               }} 
               className="button button-primary"
             >
               Assign Complaint
             </button>
           </div>
         </div>
       </div>
     ) : null
   ), [selectedComplaint, showAssignmentModal, closeModals, addNotification]);

   // Bulk Update Modal
   const BulkUpdateModal = useMemo(() => (
     showBulkUpdateModal ? (
       <div className="modal-overlay" onClick={closeModals}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <div className="modal-header">
             <h3>Bulk Status Update</h3>
             <button onClick={closeModals} className="modal-close">
               <X />
             </button>
           </div>
           <div className="modal-body">
             <div className="form-group">
               <label>Select Complaints</label>
               <div className="complaint-selection">
                 {complaints.map(complaint => (
                   <label key={complaint._id} className="complaint-checkbox">
                     <input type="checkbox" />
                     <span>{complaint.text ? complaint.text.substring(0, 50) + '...' : 'No description'}</span>
                     <span className={`status-badge status-${complaint.status}`}>{complaint.status}</span>
                   </label>
                 ))}
               </div>
             </div>
             <div className="form-group">
               <label>New Status</label>
               <select className="form-input">
                 <option value="pending">Pending</option>
                 <option value="in_progress">In Progress</option>
                 <option value="under_review">Under Review</option>
                 <option value="resolved">Resolved</option>
                 <option value="closed">Closed</option>
               </select>
             </div>
             <div className="form-group">
               <label>Admin Notes</label>
               <textarea className="form-input" rows={3} placeholder="Add notes about this bulk update..."></textarea>
             </div>
           </div>
           <div className="modal-footer">
             <button onClick={closeModals} className="button button-secondary">
               Cancel
             </button>
             <button 
               onClick={() => {
                 addNotification('Bulk status update completed successfully!', 'success');
                 closeModals();
               }} 
               className="button button-primary"
             >
               Update All Selected
             </button>
           </div>
         </div>
       </div>
     ) : null
   ), [showBulkUpdateModal, complaints, closeModals, addNotification]);

   // Export Modal
   const ExportModal = useMemo(() => (
     showExportModal ? (
       <div className="modal-overlay" onClick={closeModals}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <div className="modal-header">
             <h3>Export Data</h3>
             <button onClick={closeModals} className="modal-close">
               <X />
             </button>
           </div>
           <div className="modal-body">
             <div className="form-group">
               <label>Export Format</label>
               <select className="form-input">
                 <option value="csv">CSV</option>
                 <option value="excel">Excel</option>
                 <option value="pdf">PDF</option>
                 <option value="json">JSON</option>
               </select>
             </div>
             <div className="form-group">
               <label>Date Range</label>
               <div className="date-range">
                 <input type="date" className="form-input" />
                 <span>to</span>
                 <input type="date" className="form-input" />
               </div>
             </div>
             <div className="form-group">
               <label>Include Fields</label>
               <div className="field-selection">
                 <label className="field-checkbox">
                   <input type="checkbox" defaultChecked />
                   <span>Complaint Details</span>
                 </label>
                 <label className="field-checkbox">
                   <input type="checkbox" defaultChecked />
                   <span>User Information</span>
                 </label>
                 <label className="field-checkbox">
                   <input type="checkbox" defaultChecked />
                   <span>Status History</span>
                 </label>
                 <label className="field-checkbox">
                   <input type="checkbox" />
                   <span>Location Data</span>
                 </label>
                 <label className="field-checkbox">
                   <input type="checkbox" />
                   <span>Attachments</span>
                 </label>
               </div>
             </div>
           </div>
           <div className="modal-footer">
             <button onClick={closeModals} className="button button-secondary">
               Cancel
             </button>
             <button 
               onClick={() => {
                 addNotification('Data export completed! Check your downloads.', 'success');
                 closeModals();
               }} 
               className="button button-primary"
             >
               Export Data
             </button>
           </div>
         </div>
       </div>
     ) : null
   ), [showExportModal, closeModals, addNotification]);

   // Department Assignment Modal
   const DepartmentModal = useMemo(() => (
     showDepartmentModal ? (
       <div className="modal-overlay" onClick={closeModals}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <div className="modal-header">
             <h3>Assign to Departments</h3>
             <button onClick={closeModals} className="modal-close">
               <X />
             </button>
           </div>
           <div className="modal-body">
             <div className="form-group">
               <label>Select Complaints</label>
               <div className="complaint-selection">
                 {complaints.filter(c => c.status === 'pending').map(complaint => (
                   <label key={complaint._id} className="complaint-checkbox">
                     <input type="checkbox" />
                     <span>{complaint.text ? complaint.text.substring(0, 50) + '...' : 'No description'}</span>
                     <span className={`status-badge status-${complaint.status}`}>{complaint.status}</span>
                   </label>
                 ))}
               </div>
             </div>
             <div className="form-group">
               <label>Assign to Department</label>
               <select className="form-input">
                 <option value="">Select Department</option>
                 <option value="public_works">Public Works</option>
                 <option value="sanitation">Sanitation</option>
                 <option value="traffic">Traffic Management</option>
                 <option value="parks">Parks & Recreation</option>
                 <option value="utilities">Utilities</option>
                 <option value="security">Security</option>
               </select>
             </div>
             <div className="form-group">
               <label>Priority Level</label>
               <select className="form-input">
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
                 <option value="urgent">Urgent</option>
               </select>
             </div>
           </div>
           <div className="modal-footer">
             <button onClick={closeModals} className="button button-secondary">
               Cancel
             </button>
             <button 
               onClick={() => {
                 addNotification('Complaints assigned to departments successfully!', 'success');
                 closeModals();
               }} 
               className="button button-primary"
             >
               Assign Complaints
             </button>
           </div>
         </div>
       </div>
     ) : null
   ), [showDepartmentModal, complaints, closeModals, addNotification]);

   // Priority Management Modal
   const PriorityModal = useMemo(() => (
     showPriorityModal ? (
       <div className="modal-overlay" onClick={closeModals}>
         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           <div className="modal-header">
             <h3>Manage Priorities</h3>
             <button onClick={closeModals} className="modal-close">
               <X />
             </button>
           </div>
           <div className="modal-body">
             <div className="priority-rules">
               <h4>Priority Rules</h4>
               <div className="rule-item">
                 <label className="rule-checkbox">
                   <input type="checkbox" defaultChecked />
                   <span>Auto-escalate complaints older than 7 days</span>
                 </label>
               </div>
               <div className="rule-item">
                 <label className="rule-checkbox">
                   <input type="checkbox" defaultChecked />
                   <span>High priority for safety-related issues</span>
                 </label>
               </div>
               <div className="rule-item">
                 <label className="rule-checkbox">
                   <input type="checkbox" />
                   <span>Urgent priority for infrastructure damage</span>
                 </label>
               </div>
               <div className="rule-item">
                 <label className="rule-checkbox">
                   <input type="checkbox" />
                   <span>Medium priority for general maintenance</span>
                 </label>
               </div>
             </div>
             <div className="form-group">
               <label>Default Priority for New Complaints</label>
               <select className="form-input">
                 <option value="low">Low</option>
                 <option value="medium" selected>Medium</option>
                 <option value="high">High</option>
                 <option value="urgent">Urgent</option>
               </select>
             </div>
           </div>
           <div className="modal-footer">
             <button onClick={closeModals} className="button button-secondary">
               Cancel
             </button>
             <button 
               onClick={() => {
                 addNotification('Priority rules updated successfully!', 'success');
                 closeModals();
               }} 
               className="button button-primary"
             >
               Save Rules
             </button>
           </div>
         </div>
       </div>
     ) : null
   ), [showPriorityModal, closeModals, addNotification]);

   // Home Page Component
   const HomePage = useMemo(() => (
     <>
       <div className="nav-header">
         <h2 className="nav-title">
           <Sparkles />
           Welcome to CiviGenie
         </h2>
         <div className="nav-actions">
           <button 
             onClick={() => setView('home')} 
             className="nav-button"
           >
             <Home />
             Home
           </button>
           <button 
             onClick={() => setView('dashboard')} 
             className="nav-button"
           >
             <LayoutDashboard />
             Dashboard
           </button>
           <button 
             onClick={() => setShowSettings(true)} 
             className="nav-button"
           >
             <Settings />
           </button>
         </div>
       </div>

       <div className="home-sections">
         {/* Welcome Section */}
         <div className="home-section">
           <h3 className="home-section-title">
             <User />
             Welcome, {user?.name || 'User'}!
           </h3>
           <p className="home-welcome-text">
             You are logged in as a <strong>{user?.role || 'citizen'}</strong>. 
             Choose an option below to get started.
           </p>
         </div>

         {/* Quick Actions */}
         <div className="home-section">
           <h3 className="home-section-title">
             <Sparkles />
             Quick Actions
           </h3>
           <div className="home-actions">
             {user?.role === 'citizen' && (
               <button 
                 onClick={() => setView('submit')} 
                 className="home-action-btn"
               >
                 <FileText />
                 Submit New Complaint
               </button>
             )}
             
             {user?.role === 'administrator' && (
               <>
                 <button 
                   onClick={() => setView('admin')} 
                   className="home-action-btn"
                 >
                   <Settings />
                   Admin Panel
                 </button>
                 <button 
                   onClick={() => setView('analytics')} 
                   className="home-action-btn"
                 >
                   <BarChart3 />
                   Analytics Dashboard
                 </button>
               </>
             )}
             
             {user?.role === 'department_staff' && (
               <>
                 <button 
                   onClick={() => setView('staff')} 
                   className="home-action-btn"
                 >
                   <Settings />
                   Staff Panel
                 </button>
                 <button 
                   onClick={() => setView('assigned')} 
                   className="home-action-btn"
                 >
                   <ClipboardList />
                   Assigned Tasks
                 </button>
               </>
             )}
             
             <button 
               onClick={() => setView('dashboard')} 
               className="home-action-btn"
             >
               <LayoutDashboard />
               View All Complaints
             </button>
             
             <button 
               onClick={() => setShowSettings(true)} 
               className="home-action-btn"
             >
               <Settings />
               Settings & Profile
             </button>
           </div>
         </div>

         {/* Recent Activity */}
         <div className="home-section">
           <h3 className="home-section-title">
             <Clock />
             Recent Activity
           </h3>
           <div className="home-activity-list">
             {complaints.slice(0, 3).map(complaint => (
               <div key={complaint._id} className="home-activity-item">
                 <div className="home-activity-icon">
                   <FileText />
                 </div>
                 <div className="home-activity-content">
                   <div className="home-activity-title">New complaint submitted</div>
                   <div className="home-activity-details">{complaint.text ? complaint.text.substring(0, 40) + '...' : 'No description available'}</div>
                   <div className="home-activity-time">{new Date(complaint.createdAt).toLocaleString()}</div>
                 </div>
                 <div className="home-activity-status">
                   <span className={`status-badge status-${complaint.status}`}>
                     {complaint.status}
                   </span>
                 </div>
               </div>
             ))}
             {complaints.length === 0 && (
               <div className="home-empty-state">
                 <p>No recent activity. Start by submitting a complaint!</p>
               </div>
             )}
           </div>
         </div>
       </div>
     </>
   ), [user, complaints, setView, setShowSettings]);

   // Admin Panel Component
   const AdminPanel = useMemo(() => (
     <>
       <div className="nav-header">
         <h2 className="nav-title">
           <Settings />
           Admin Panel
         </h2>
         <div className="nav-actions">
           <button 
             onClick={() => setView('dashboard')} 
             className="nav-button"
           >
             <LayoutDashboard />
             Back to Dashboard
           </button>
           <button 
             onClick={() => setShowSettings(true)} 
             className="nav-button"
           >
             <Settings />
           </button>
         </div>
       </div>

       <div className="admin-sections">
         {/* Complaint Management */}
         <div className="admin-section">
           <h3 className="admin-section-title">
             <FileText />
             Complaint Management
           </h3>
           <div className="admin-stats">
             <div className="stat-card">
               <div className="stat-number">{complaints.length}</div>
               <div className="stat-label">Total Complaints</div>
             </div>
             <div className="stat-card">
               <div className="stat-number">{complaints.filter(c => c.status === 'pending').length}</div>
               <div className="stat-label">Pending</div>
             </div>
             <div className="stat-card">
               <div className="stat-number">{complaints.filter(c => c.status === 'in_progress').length}</div>
               <div className="stat-label">In Progress</div>
             </div>
             <div className="stat-card">
               <div className="stat-number">{complaints.filter(c => c.status === 'resolved').length}</div>
               <div className="stat-label">Resolved</div>
             </div>
           </div>
         </div>

         {/* Quick Actions */}
         <div className="admin-section">
           <h3 className="admin-section-title">
             <Sparkles />
             Quick Actions
           </h3>
           <div className="admin-actions">
             <button 
               onClick={handleBulkStatusUpdate}
               className="admin-action-btn"
             >
               <Edit3 />
               Bulk Status Update
             </button>
             <button 
               onClick={handleExportData}
               className="admin-action-btn"
             >
               <FileText />
               Export Data
             </button>
             <button 
               onClick={handleDepartmentAssignment}
               className="admin-action-btn"
             >
               <User />
               Assign to Departments
             </button>
             <button 
               onClick={handlePriorityManagement}
               className="admin-action-btn"
             >
               <AlertCircle />
               Manage Priorities
             </button>
           </div>
         </div>

         {/* System Settings */}
         <div className="admin-section">
           <h3 className="admin-section-title">
             <Settings />
             System Settings
           </h3>
           <div className="settings-grid">
             <div className="setting-item">
               <div className="setting-info">
                 <h4>Auto-Assignment</h4>
                 <p>Automatically assign complaints to departments</p>
               </div>
               <div className="toggle-switch">
                 <input 
                   type="checkbox" 
                   id="auto-assign" 
                   checked={adminSettings.autoAssignment}
                   onChange={(e) => handleAdminSettingChange('autoAssignment', e.target.checked)}
                 />
                 <label htmlFor="auto-assign" className="toggle-label"></label>
               </div>
             </div>
             <div className="setting-item">
               <div className="setting-info">
                 <h4>Email Notifications</h4>
                 <p>Send email notifications to citizens</p>
               </div>
               <div className="toggle-switch">
                 <input 
                   type="checkbox" 
                   id="email-notifications" 
                   checked={adminSettings.emailNotifications}
                   onChange={(e) => handleAdminSettingChange('emailNotifications', e.target.checked)}
                 />
                 <label htmlFor="email-notifications" className="toggle-label"></label>
               </div>
             </div>
             <div className="setting-item">
               <div className="setting-info">
                 <h4>Auto-Escalation</h4>
                 <p>Automatically escalate urgent complaints</p>
               </div>
               <div className="toggle-switch">
                 <input 
                   type="checkbox" 
                   id="auto-escalation" 
                   checked={adminSettings.autoEscalation}
                   onChange={(e) => handleAdminSettingChange('autoEscalation', e.target.checked)}
                 />
                 <label htmlFor="auto-escalation" className="toggle-label"></label>
               </div>
             </div>
             <div className="setting-item">
               <div className="setting-info">
                 <h4>Performance Tracking</h4>
                 <p>Track department performance metrics</p>
               </div>
               <div className="toggle-switch">
                 <input 
                   type="checkbox" 
                   id="performance-tracking" 
                   checked={adminSettings.performanceTracking}
                   onChange={(e) => handleAdminSettingChange('performanceTracking', e.target.checked)}
                 />
                 <label htmlFor="performance-tracking" className="toggle-label"></label>
               </div>
             </div>
           </div>
         </div>

         {/* Recent Activity */}
         <div className="admin-section">
           <h3 className="admin-section-title">
             <Clock />
             Recent Activity
           </h3>
           <div className="activity-list">
             {complaints.slice(0, 5).map(complaint => (
               <div key={complaint._id} className="activity-item">
                 <div className="activity-icon">
                   <FileText />
                 </div>
                 <div className="activity-content">
                   <div className="activity-title">New complaint submitted</div>
                   <div className="activity-details">{complaint.text ? complaint.text.substring(0, 50) + '...' : 'No description available'}</div>
                   <div className="activity-time">{new Date(complaint.createdAt).toLocaleString()}</div>
                 </div>
                 <div className="activity-status">
                   <span className={`status-badge status-${complaint.status}`}>
                     {complaint.status}
                   </span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </>
   ), [complaints, addNotification, setView, setShowSettings, handleBulkStatusUpdate, handleExportData, handleDepartmentAssignment, handlePriorityManagement, handleAdminSettingChange, adminSettings]);

   // Staff Panel Component
   const StaffPanel = useMemo(() => (
     <>
                <div className="nav-header">
           <h2 className="nav-title">
             <Settings />
             Staff Panel
           </h2>
           <div className="nav-actions">
             <button 
               onClick={() => setView('dashboard')} 
               className="nav-button"
             >
               <LayoutDashboard />
               Back to Dashboard
             </button>
             <button 
               onClick={() => setShowSettings(true)} 
               className="nav-button"
             >
               <Settings />
             </button>
           </div>
         </div>

       <div className="admin-sections">
         {/* Assigned Complaints */}
         <div className="admin-section">
           <h3 className="admin-section-title">
             <ClipboardList />
             My Assigned Complaints
           </h3>
           <div className="admin-stats">
             <div className="stat-card">
               <div className="stat-number">{complaints.filter(c => c.status === 'assigned').length}</div>
               <div className="stat-label">Assigned to Me</div>
             </div>
             <div className="stat-card">
               <div className="stat-number">{complaints.filter(c => c.status === 'in_progress').length}</div>
               <div className="stat-label">In Progress</div>
             </div>
             <div className="stat-card">
               <div className="stat-number">{complaints.filter(c => c.status === 'completed').length}</div>
               <div className="stat-label">Completed</div>
             </div>
             <div className="stat-card">
               <div className="stat-number">{complaints.filter(c => c.status === 'pending').length}</div>
               <div className="stat-label">Pending Review</div>
             </div>
           </div>
         </div>

         {/* Quick Actions */}
         <div className="admin-section">
           <h3 className="admin-section-title">
             <Sparkles />
             Quick Actions
           </h3>
           <div className="admin-actions">
             <button 
               onClick={() => setView('assigned')} 
               className="admin-action-btn"
             >
               <ClipboardList />
               View Assigned Tasks
             </button>
             <button 
               onClick={() => {
                 addNotification('Work report feature coming soon!', 'info');
               }}
               className="admin-action-btn"
             >
               <FileText />
               Submit Work Report
             </button>
             <button 
               onClick={() => {
                 addNotification('Team collaboration feature coming soon!', 'info');
               }}
               className="admin-action-btn"
             >
               <Users />
               Team Collaboration
             </button>
             <button 
               onClick={() => {
                 addNotification('Resource request feature coming soon!', 'info');
               }}
               className="admin-action-btn"
             >
               <AlertCircle />
               Request Resources
             </button>
           </div>
         </div>

         {/* Work Progress */}
         <div className="admin-section">
           <h3 className="admin-section-title">
             <BarChart3 />
             Work Progress
           </h3>
           <div className="settings-grid">
             <div className="setting-item">
               <div className="setting-info">
                 <h4>Auto-Status Updates</h4>
                 <p>Automatically update complaint status based on progress</p>
               </div>
               <div className="toggle-switch">
                 <input type="checkbox" id="auto-status" defaultChecked />
                 <label htmlFor="auto-status" className="toggle-label"></label>
               </div>
             </div>
             <div className="setting-item">
               <div className="setting-info">
                 <h4>Work Notifications</h4>
                 <p>Receive notifications for new assignments</p>
               </div>
               <div className="toggle-switch">
                 <input type="checkbox" id="work-notifications" defaultChecked />
                 <label htmlFor="work-notifications" className="toggle-label"></label>
               </div>
             </div>
             <div className="setting-item">
               <div className="setting-info">
                 <h4>Progress Tracking</h4>
                 <p>Track detailed progress of assigned complaints</p>
               </div>
               <div className="toggle-switch">
                 <input type="checkbox" id="progress-tracking" defaultChecked />
                 <label htmlFor="progress-tracking" className="toggle-label"></label>
               </div>
             </div>
             <div className="setting-item">
               <div className="setting-info">
                 <h4>Team Updates</h4>
                 <p>Share updates with team members</p>
               </div>
               <div className="toggle-switch">
                 <input type="checkbox" id="team-updates" />
                 <label htmlFor="team-updates" className="toggle-label"></label>
               </div>
             </div>
           </div>
         </div>

         {/* Recent Work Activity */}
         <div className="admin-section">
           <h3 className="admin-section-title">
             <Clock />
             Recent Work Activity
           </h3>
           <div className="activity-list">
             {complaints.slice(0, 5).map(complaint => (
               <div key={complaint._id} className="activity-item">
                 <div className="activity-icon">
                   <FileText />
                 </div>
                 <div className="activity-content">
                   <div className="activity-title">Complaint assigned</div>
                   <div className="activity-details">{complaint.text ? complaint.text.substring(0, 50) + '...' : 'No description available'}</div>
                   <div className="activity-time">{new Date(complaint.createdAt).toLocaleString()}</div>
                 </div>
                 <div className="activity-status">
                   <span className={`status-badge status-${complaint.status}`}>
                     {complaint.status}
                   </span>
                 </div>
               </div>
             ))}
             {complaints.length === 0 && (
               <div className="home-empty-state">
                 <p>No recent work activity. Check for new assignments!</p>
               </div>
             )}
           </div>
         </div>
       </div>
     </>
   ), [complaints, addNotification, setView, setShowSettings]);

   // Assigned Tasks Component
   const AssignedTasks = useMemo(() => (
     <>
                <div className="nav-header">
           <h2 className="nav-title">
             <ClipboardList />
             Assigned Tasks
           </h2>
           <div className="nav-actions">
             <button 
               onClick={() => setView('staff')} 
               className="nav-button"
             >
               <Settings />
               Back to Staff Panel
             </button>
             <button 
               onClick={() => setShowSettings(true)} 
               className="nav-button"
             >
               <Settings />
             </button>
           </div>
         </div>

       <div className="admin-sections">
         <div className="admin-section">
           <h3 className="admin-section-title">
             <ClipboardList />
             My Assigned Complaints
           </h3>
           {complaints.length === 0 ? (
             <div className="empty-state">
               <div className="empty-icon">
                 <ClipboardList />
               </div>
               <p className="empty-title">No assigned complaints</p>
               <p className="empty-subtitle">You don't have any complaints assigned to you yet.</p>
             </div>
           ) : (
             <div className="complaints-list">
               {complaints.map(complaint => (
                 <div key={complaint._id} className="complaint-card">
                   <div className="complaint-header">
                     <div className="complaint-main">
                       <div className="complaint-text">{complaint.text || 'No description available'}</div>
                       <div className="complaint-user">
                         <User className="user-icon" />
                         Assigned to you
                       </div>
                     </div>
                     <div className="complaint-status">
                       <span className={`status-badge status-${complaint.status}`}>
                         {complaint.status}
                       </span>
                     </div>
                   </div>
                   
                   <div className="complaint-details">
                     <div className="complaint-meta">
                       <div className="meta-item">
                         <Clock className="meta-icon" />
                         <span className="meta-label">Assigned:</span>
                         <span className="meta-value">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                       </div>
                       {complaint.priority && (
                         <div className="meta-item">
                           <AlertCircle className="meta-icon" />
                           <span className="meta-label">Priority:</span>
                           <span className={`priority-badge priority-${complaint.priority}`}>
                             {complaint.priority}
                           </span>
                         </div>
                       )}
                     </div>
                     
                     {complaint.location && (
                       <div className="complaint-location">
                         <MapPin className="location-icon" />
                         {complaint.location.address}
                       </div>
                     )}
                     
                     {complaint.images && complaint.images.length > 0 && (
                       <div className="complaint-images">
                         <div className="images-label">
                           <Camera className="meta-icon" />
                           {complaint.images.length} image(s) attached
                         </div>
                       </div>
                     )}
                   </div>
                   
                   <div className="complaint-actions">
                     <button 
                       onClick={() => handleViewDetails(complaint)}
                       className="action-button"
                     >
                       <FileText />
                       View Details
                     </button>
                     <button 
                       onClick={() => handleUpdateStatus(complaint)}
                       className="action-button staff-action"
                     >
                       <Edit3 />
                       Update Progress
                     </button>
                     <button 
                       onClick={() => {
                         addNotification('Work completion feature coming soon!', 'info');
                       }}
                       className="action-button staff-action"
                     >
                       <CheckCircle />
                       Mark Complete
                     </button>
                   </div>
                   
                   <div className="complaint-footer">
                     <div className="complaint-time">
                       <Clock />
                       {new Date(complaint.createdAt).toLocaleString()}
                     </div>
                     <div className="complaint-id">ID: {complaint._id.slice(-8)}</div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
     </>
   ), [complaints, handleViewDetails, handleUpdateStatus, addNotification, setView, setShowSettings]);

   // Show authentication forms
   if (authView === 'login') {
     return (
       <div className="auth-container">
         {/* Notifications for auth pages */}
         <div className="notifications-container">
           {notifications.map(notification => (
             <div key={notification.id} className={`notification notification-${notification.type}`}>
               <Bell className="notification-icon" />
               <span className="notification-message">{notification.message}</span>
             </div>
           ))}
         </div>
         <LoginForm onLogin={handleLogin} onSignup={() => setAuthView('signup')} loading={authLoading} />
       </div>
     );
   }

   if (authView === 'signup') {
     return (
       <div className="auth-container">
         {/* Notifications for auth pages */}
         <div className="notifications-container">
           {notifications.map(notification => (
             <div key={notification.id} className={`notification notification-${notification.type}`}>
               <Bell className="notification-icon" />
               <span className="notification-message">{notification.message}</span>
             </div>
           ))}
         </div>
         <SignupForm onSignup={handleSignup} onLogin={() => setAuthView('login')} loading={authLoading} />
       </div>
     );
   }

  // Main app view
  return (
    <div className="app-container">
      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification notification-${notification.type}`}>
            <Bell className="notification-icon" />
            <span className="notification-message">{notification.message}</span>
          </div>
        ))}
      </div>

      <header className="header">
        <div className="header-top">
          <div className="logo-container" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <Sparkles />
            </div>
            <h1 className="title">
              CiviGenie
            </h1>
          </div>
        </div>
        <p className="tagline">
          Your Voice, Our Priority
        </p>
        <p className="subtitle">
          Empowering citizens through intelligent civic complaint management
        </p>
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        )}
      </header>
      
             <main>
         {showSettings ? SettingsPanel : 
       submittedComplaint ? ComplaintSuccess :
       (view === 'home' ? HomePage :
        view === 'submit' ? ComplaintSubmission : 
        view === 'admin' ? AdminPanel :
        view === 'staff' ? StaffPanel :
        view === 'assigned' ? AssignedTasks : Dashboard)}
       </main>

      {/* Modals */}
      {ComplaintDetailsModal}
      {StatusUpdateModal}
      {AssignmentModal}
      {BulkUpdateModal}
      {ExportModal}
      {DepartmentModal}
      {PriorityModal}
      
      <footer className="footer">
        <p>© 2024 CiviGenie. Empowering citizens through technology.</p>
        <div className="status-indicators">
          <span className="status-indicator">
            <div className="status-dot green"></div>
            Backend Connected
          </span>
          <span className="status-indicator">
            <div className="status-dot blue"></div>
            PWA Ready
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
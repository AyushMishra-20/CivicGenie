import React, { useState, useEffect } from 'react'
import ComplaintForm from './components/ComplaintForm'
import Dashboard from './components/Dashboard'
import ComplaintSuccess from './components/ComplaintSuccess'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import HomePage from './components/HomePage'
import AuthWrapper from './components/Auth/AuthWrapper'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import OfflineIndicator from './components/OfflineIndicator'
import SmartSyncIndicator from './components/SmartSyncIndicator'
import NotificationSettings from './components/NotificationSettings'
import { Complaint } from '../../shared/types/complaint'
import pwaService from './utils/pwaService'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'form' | 'dashboard' | 'analytics' | 'success' | 'notifications'>('home');
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const handleComplaintSubmitted = (complaint: Complaint) => {
    setSubmittedComplaint(complaint);
    setActiveTab('success');
  };

  const handleBackToForm = () => {
    setActiveTab('form');
    setSubmittedComplaint(null);
  };

  const handleViewDashboard = () => {
    setActiveTab('dashboard');
  };

  const handleGetStarted = () => {
    setActiveTab('form');
  };

  const handleViewAnalytics = () => {
    setActiveTab('analytics');
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleNotificationSettings = () => {
    setShowNotificationSettings(!showNotificationSettings);
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Show authentication if not logged in
  if (!isAuthenticated) {
    return <AuthWrapper onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="App">
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />
      <SmartSyncIndicator />
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏛️</span>
            <h1>CivicGenie</h1>
          </div>
          <div className="user-info">
            <p className="tagline">AI-Powered Civic Complaint Assistant</p>
            <div className="user-details">
              <span>Welcome, {user?.name}</span>
              <div className="user-actions">
                <button 
                  onClick={handleNotificationSettings} 
                  className="notification-btn"
                  title="Notification Settings"
                >
                  🔔
                </button>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {activeTab !== 'success' && (
          <nav className="app-nav">
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`}
            >
              📝 Submit Complaint
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              📈 Analytics
            </button>
          </nav>
        )}
      </header>
      
      <main className="main-content">
        {activeTab === 'home' ? (
          <HomePage 
            onGetStarted={handleGetStarted}
            onViewDashboard={handleViewDashboard}
            onViewAnalytics={handleViewAnalytics}
            user={user}
          />
        ) : activeTab === 'form' ? (
          <div className="container">
            <div className="hero-section">
              <h2>Report Civic Issues in Your Language</h2>
              <p>Help make Mumbai better by reporting broken roads, garbage issues, and water problems. Our AI will categorize and forward your complaint to the right BMC department.</p>
            </div>
            
            <ComplaintForm onComplaintSubmitted={handleComplaintSubmitted} />
          </div>
        ) : activeTab === 'dashboard' ? (
          <Dashboard />
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : activeTab === 'success' && submittedComplaint ? (
          <ComplaintSuccess 
            complaint={submittedComplaint}
            onBackToForm={handleBackToForm}
            onViewDashboard={handleViewDashboard}
          />
        ) : null}
      </main>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="modal-overlay" onClick={handleNotificationSettings}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <NotificationSettings />
            <button 
              className="modal-close"
              onClick={handleNotificationSettings}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <footer className="app-footer">
        <p>&copy; 2024 CivicGenie - Empowering Citizens, Improving Cities</p>
        <div className="pwa-info">
          <span>📱 Install as App</span>
          <span>🔄 Works Offline</span>
          <span>🔔 Push Notifications</span>
        </div>
      </footer>
    </div>
  )
}

export default App 
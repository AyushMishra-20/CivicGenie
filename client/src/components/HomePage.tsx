import React from 'react';
import { motion } from 'framer-motion';
import './HomePage.css';

interface HomePageProps {
  onGetStarted: () => void;
  onViewDashboard: () => void;
  onViewAnalytics: () => void;
  user: any;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onGetStarted, 
  onViewDashboard, 
  onViewAnalytics, 
  user 
}) => {
  const features = [
    {
      icon: '🏛️',
      title: 'AI-Powered',
      description: 'Smart categorization and routing to the right department'
    },
    {
      icon: '🌐',
      title: 'Multi-Language',
      description: 'Report issues in your preferred language'
    },
    {
      icon: '📱',
      title: 'Mobile First',
      description: 'Optimized for mobile devices and works offline'
    },
    {
      icon: '⚡',
      title: 'Real-time',
      description: 'Track your complaint status in real-time'
    }
  ];

  const quickActions = [
    {
      icon: '🚧',
      title: 'Road Issues',
      description: 'Potholes, broken roads, street lights',
      color: '#f97316'
    },
    {
      icon: '🗑️',
      title: 'Garbage',
      description: 'Waste collection, overflowing bins',
      color: '#10b981'
    },
    {
      icon: '💧',
      title: 'Water',
      description: 'Water supply, leaks, quality issues',
      color: '#3b82f6'
    },
    {
      icon: '🌳',
      title: 'Parks & Gardens',
      description: 'Maintenance, cleanliness, facilities',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-badge">
            <span>🏛️</span>
            <span>AI-Powered Civic Platform</span>
          </div>
          
          <h1 className="hero-title">
            Make Mumbai
            <span className="gradient-text"> Better</span>
          </h1>
          
          <p className="hero-description">
            Report civic issues in your language. Our AI will categorize and forward 
            your complaint to the right BMC department for quick resolution.
          </p>
          
          <div className="hero-actions">
            <motion.button
              className="btn-primary"
              onClick={onGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📝 Report an Issue
            </motion.button>
            
            <motion.button
              className="btn-secondary"
              onClick={onViewDashboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📊 View Dashboard
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="floating-card">
            <div className="card-header">
              <span className="status-dot active"></span>
              <span>Complaint Submitted</span>
            </div>
            <div className="card-content">
              <p>Road repair needed at Marine Drive</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
              <span className="progress-text">75% Complete</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <motion.div 
          className="welcome-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2>Welcome back, {user?.name || 'Citizen'}! 👋</h2>
          <p>Ready to make a difference in your community?</p>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <motion.h3 
          className="section-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Quick Report Categories
        </motion.h3>
        
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              className="quick-action-card"
              style={{ '--accent-color': action.color } as any}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="action-icon">{action.icon}</div>
              <h4>{action.title}</h4>
              <p>{action.description}</p>
              <button 
                className="action-btn"
                onClick={onGetStarted}
              >
                Report Issue
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.h3 
          className="section-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Why Choose CivicGenie?
        </motion.h3>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <motion.div 
          className="stats-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="stat-item">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Issues Resolved</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5+</div>
            <div className="stat-label">Languages</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">48hrs</div>
            <div className="stat-label">Avg Response</div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <h2>Ready to make a difference?</h2>
          <p>Join thousands of citizens making Mumbai better, one complaint at a time.</p>
          <motion.button
            className="btn-primary btn-large"
            onClick={onGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Get Started Now
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;

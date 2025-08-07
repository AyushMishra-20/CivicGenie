import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './EnhancedAIAnalysis.css';

interface EnhancedAIAnalysisProps {
  analysis: {
    category: string;
    priority: string;
    department: string;
    estimatedResolutionTime: string;
    keywords: string[];
    confidence: number;
    suggestions: string[];
    aiModel: string;
    processingTime: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    urgencyScore: number;
    complexityScore: number;
    predictedResolutionSteps: string[];
  };
}

const EnhancedAIAnalysis: React.FC<EnhancedAIAnalysisProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'predictions'>('overview');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📋';
      case 'low': return '✅';
      default: return '📝';
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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatProcessingTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  return (
    <motion.div
      className="enhanced-ai-analysis"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="analysis-header">
        <div className="header-content">
          <h3>🤖 AI Analysis Results</h3>
          <p>Advanced analysis powered by {analysis.aiModel}</p>
          <div className="processing-info">
            <span className="processing-time">
              ⏱️ Processed in {formatProcessingTime(analysis.processingTime)}
            </span>
            <span className="confidence-score">
              🎯 {Math.round(analysis.confidence * 100)}% Confidence
            </span>
          </div>
        </div>
      </div>

      <div className="analysis-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          🔍 Details
        </button>
        <button
          className={`tab ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          🔮 Predictions
        </button>
      </div>

      <div className="analysis-content">
        {activeTab === 'overview' && (
          <motion.div
            className="overview-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overview-grid">
              <div className="analysis-card category">
                <div className="card-icon">{getCategoryIcon(analysis.category)}</div>
                <div className="card-content">
                  <h5>Category</h5>
                  <p className="category-name">
                    {analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1)}
                  </p>
                </div>
              </div>

              <div className="analysis-card priority">
                <div className="card-icon">{getPriorityIcon(analysis.priority)}</div>
                <div className="card-content">
                  <h5>Priority</h5>
                  <p 
                    className="priority-name"
                    style={{ color: getPriorityColor(analysis.priority) }}
                  >
                    {analysis.priority.charAt(0).toUpperCase() + analysis.priority.slice(1)}
                  </p>
                </div>
              </div>

              <div className="analysis-card sentiment">
                <div className="card-icon">{getSentimentIcon(analysis.sentiment)}</div>
                <div className="card-content">
                  <h5>Sentiment</h5>
                  <p 
                    className="sentiment-name"
                    style={{ color: getSentimentColor(analysis.sentiment) }}
                  >
                    {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                  </p>
                </div>
              </div>

              <div className="analysis-card department">
                <div className="card-icon">🏛️</div>
                <div className="card-content">
                  <h5>Department</h5>
                  <p className="department-name">{analysis.department}</p>
                </div>
              </div>

              <div className="analysis-card urgency">
                <div className="card-icon">⚡</div>
                <div className="card-content">
                  <h5>Urgency Score</h5>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${(analysis.urgencyScore / 10) * 100}%`,
                        backgroundColor: getPriorityColor(analysis.priority)
                      }}
                    ></div>
                    <span className="score-text">{analysis.urgencyScore}/10</span>
                  </div>
                </div>
              </div>

              <div className="analysis-card complexity">
                <div className="card-icon">🧩</div>
                <div className="card-content">
                  <h5>Complexity</h5>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${(analysis.complexityScore / 10) * 100}%`,
                        backgroundColor: '#8b5cf6'
                      }}
                    ></div>
                    <span className="score-text">{analysis.complexityScore}/10</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="confidence-section">
              <h5>AI Confidence</h5>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${analysis.confidence * 100}%` }}
                ></div>
                <span className="confidence-text">{Math.round(analysis.confidence * 100)}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'details' && (
          <motion.div
            className="details-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="details-section">
              <h5>⏰ Estimated Resolution Time</h5>
              <p className="resolution-time">{analysis.estimatedResolutionTime}</p>
            </div>

            {analysis.keywords.length > 0 && (
              <div className="details-section">
                <h5>🏷️ Keywords</h5>
                <div className="keywords-list">
                  {analysis.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div className="details-section">
                <h5>💡 AI Suggestions</h5>
                <ul className="suggestions-list">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="details-section">
              <h5>🔧 Technical Details</h5>
              <div className="technical-details">
                <div className="detail-item">
                  <span className="detail-label">AI Model:</span>
                  <span className="detail-value">{analysis.aiModel}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Processing Time:</span>
                  <span className="detail-value">{formatProcessingTime(analysis.processingTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Confidence:</span>
                  <span className="detail-value">{Math.round(analysis.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'predictions' && (
          <motion.div
            className="predictions-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="predictions-section">
              <h5>🛣️ Predicted Resolution Steps</h5>
              <div className="steps-timeline">
                {analysis.predictedResolutionSteps.map((step, index) => (
                  <div key={index} className="timeline-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <p>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="predictions-section">
              <h5>📈 Resolution Timeline</h5>
              <div className="timeline-visualization">
                <div className="timeline-bar">
                  <div className="timeline-progress" style={{ width: '25%' }}>
                    <span className="timeline-label">Issue Verification</span>
                  </div>
                  <div className="timeline-progress" style={{ width: '25%' }}>
                    <span className="timeline-label">Department Assignment</span>
                  </div>
                  <div className="timeline-progress" style={{ width: '25%' }}>
                    <span className="timeline-label">Resolution Planning</span>
                  </div>
                  <div className="timeline-progress" style={{ width: '25%' }}>
                    <span className="timeline-label">Implementation</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedAIAnalysis; 
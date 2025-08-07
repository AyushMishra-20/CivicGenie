import React from 'react';
import './AIAnalysisDisplay.css';

interface AIAnalysisDisplayProps {
  analysis: {
    category: string;
    priority: string;
    department: string;
    estimatedResolutionTime: string;
    keywords: string[];
    confidence: number;
    suggestions: string[];
  };
}

const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({ analysis }) => {
  // Validate analysis data
  if (!analysis || typeof analysis !== 'object') {
    return (
      <div className="ai-analysis-display">
        <div className="analysis-header">
          <h4>🤖 AI Analysis Results</h4>
          <p>Analysis data is unavailable</p>
        </div>
      </div>
    );
  }
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

  return (
    <div className="ai-analysis-display">
      <div className="analysis-header">
        <h4>🤖 AI Analysis Results</h4>
        <p>Your complaint has been analyzed and categorized</p>
      </div>

      <div className="analysis-grid">
        <div className="analysis-card category">
          <div className="card-icon">{getCategoryIcon(analysis.category)}</div>
          <div className="card-content">
            <h5>Category</h5>
                         <p className="category-name">{analysis.category ? analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1) : 'Unknown'}</p>
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
                             {analysis.priority ? analysis.priority.charAt(0).toUpperCase() + analysis.priority.slice(1) : 'Unknown'}
            </p>
          </div>
        </div>

        <div className="analysis-card department">
          <div className="card-icon">🏛️</div>
          <div className="card-content">
            <h5>Department</h5>
                         <p className="department-name">{analysis.department || 'General Department'}</p>
          </div>
        </div>

        <div className="analysis-card timeline">
          <div className="card-icon">⏰</div>
          <div className="card-content">
            <h5>Estimated Resolution</h5>
                         <p className="timeline-text">{analysis.estimatedResolutionTime || '1-2 weeks'}</p>
          </div>
        </div>
      </div>

      <div className="analysis-details">
        <div className="confidence-section">
          <h5>AI Confidence</h5>
          <div className="confidence-bar">
            <div 
              className="confidence-fill"
                             style={{ width: `${(analysis.confidence || 0.7) * 100}%` }}
             ></div>
             <span className="confidence-text">{Math.round((analysis.confidence || 0.7) * 100)}%</span>
          </div>
        </div>

                 {(analysis.keywords || []).length > 0 && (
          <div className="keywords-section">
            <h5>Keywords</h5>
            <div className="keywords-list">
              {analysis.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        )}

                 {(analysis.suggestions || []).length > 0 && (
          <div className="suggestions-section">
            <h5>💡 Suggestions</h5>
            <ul className="suggestions-list">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisDisplay; 
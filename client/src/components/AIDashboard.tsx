import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './AIDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PredictiveAnalysis {
  trendAnalysis: {
    categoryTrends: Array<{category: string, trend: 'increasing' | 'decreasing' | 'stable', percentage: number}>;
    priorityDistribution: Record<string, number>;
    resolutionTimePredictions: Record<string, string>;
  };
  recommendations: string[];
  riskAssessment: {
    highRiskAreas: string[];
    seasonalPatterns: string[];
    capacityPlanning: string[];
  };
}

interface AIDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIDashboard: React.FC<AIDashboardProps> = ({ isOpen, onClose }) => {
  const [analysis, setAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'trends' | 'predictions' | 'risks'>('trends');

  useEffect(() => {
    if (isOpen) {
      fetchPredictiveAnalysis();
    }
  }, [isOpen]);

  const fetchPredictiveAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/analytics/predictive', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictive analysis');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error fetching predictive analysis:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return '#ef4444';
      case 'decreasing': return '#10b981';
      default: return '#6b7280';
    }
  };

  const categoryTrendsData = {
    labels: analysis?.trendAnalysis.categoryTrends.map(t => t.category) || [],
    datasets: [
      {
        label: 'Complaint Percentage',
        data: analysis?.trendAnalysis.categoryTrends.map(t => t.percentage) || [],
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const priorityDistributionData = {
    labels: Object.keys(analysis?.trendAnalysis.priorityDistribution || {}),
    datasets: [
      {
        data: Object.values(analysis?.trendAnalysis.priorityDistribution || {}),
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#3b82f6',
          '#10b981',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'AI Predictive Analytics',
      },
    },
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="ai-dashboard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="ai-dashboard-container"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dashboard-header">
          <div className="header-content">
            <h2>🤖 AI Analytics Dashboard</h2>
            <p>Predictive insights and trend analysis</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab ${activeSection === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveSection('trends')}
          >
            📊 Trends
          </button>
          <button
            className={`tab ${activeSection === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveSection('predictions')}
          >
            🔮 Predictions
          </button>
          <button
            className={`tab ${activeSection === 'risks' ? 'active' : ''}`}
            onClick={() => setActiveSection('risks')}
          >
            ⚠️ Risk Assessment
          </button>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Analyzing data with AI...</p>
            </div>
          ) : analysis ? (
            <>
              {activeSection === 'trends' && (
                <motion.div
                  className="trends-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="section-header">
                    <h3>📈 Category Trends</h3>
                    <p>AI-powered trend analysis across complaint categories</p>
                  </div>

                  <div className="charts-grid">
                    <div className="chart-container">
                      <h4>Category Distribution</h4>
                      <Bar data={categoryTrendsData} options={chartOptions} />
                    </div>
                    
                    <div className="chart-container">
                      <h4>Priority Distribution</h4>
                      <Doughnut data={priorityDistributionData} options={chartOptions} />
                    </div>
                  </div>

                  <div className="trends-list">
                    <h4>Trend Analysis</h4>
                    <div className="trend-items">
                      {analysis.trendAnalysis.categoryTrends.map((trend, index) => (
                        <div key={index} className="trend-item">
                          <div className="trend-icon" style={{ color: getTrendColor(trend.trend) }}>
                            {getTrendIcon(trend.trend)}
                          </div>
                          <div className="trend-content">
                            <h5>{trend.category}</h5>
                            <p>{trend.trend} trend - {trend.percentage}% of total complaints</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'predictions' && (
                <motion.div
                  className="predictions-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="section-header">
                    <h3>🔮 Resolution Predictions</h3>
                    <p>AI-estimated resolution times by category</p>
                  </div>

                  <div className="predictions-grid">
                    {Object.entries(analysis.trendAnalysis.resolutionTimePredictions).map(([category, time], index) => (
                      <div key={index} className="prediction-card">
                        <div className="prediction-icon">⏰</div>
                        <div className="prediction-content">
                          <h5>{category}</h5>
                          <p className="prediction-time">{time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="recommendations-section">
                    <h4>💡 AI Recommendations</h4>
                    <div className="recommendations-list">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="recommendation-item">
                          <span className="recommendation-number">{index + 1}</span>
                          <p>{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'risks' && (
                <motion.div
                  className="risks-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="section-header">
                    <h3>⚠️ Risk Assessment</h3>
                    <p>AI-identified risk areas and patterns</p>
                  </div>

                  <div className="risks-grid">
                    <div className="risk-card high-risk">
                      <h4>🚨 High Risk Areas</h4>
                      <ul>
                        {analysis.riskAssessment.highRiskAreas.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="risk-card seasonal">
                      <h4>🌦️ Seasonal Patterns</h4>
                      <ul>
                        {analysis.riskAssessment.seasonalPatterns.map((pattern, index) => (
                          <li key={index}>{pattern}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="risk-card capacity">
                      <h4>👥 Capacity Planning</h4>
                      <ul>
                        {analysis.riskAssessment.capacityPlanning.map((plan, index) => (
                          <li key={index}>{plan}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="error-state">
              <p>No AI analysis data available</p>
              <button onClick={fetchPredictiveAnalysis} className="retry-btn">
                Retry Analysis
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIDashboard; 
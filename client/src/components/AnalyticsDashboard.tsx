import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './AnalyticsDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStats {
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  resolutionRate: number;
  averageResolutionTime: number;
  complaintsByCategory: Record<string, number>;
  complaintsByPriority: Record<string, number>;
  complaintsByStatus: Record<string, number>;
  recentActivity: any[];
  topDepartments: any[];
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
}

interface TrendData {
  date: string;
  complaints: number;
  resolved: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard stats and trends in parallel
      const [statsResponse, trendsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/analytics/dashboard', { headers }),
        fetch(`http://localhost:5000/api/analytics/trends?days=${timeRange}`, { headers })
      ]);

      if (!statsResponse.ok || !trendsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, trendsData] = await Promise.all([
        statsResponse.json(),
        trendsResponse.json()
      ]);

      setStats(statsData);
      setTrends(trendsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/analytics/export/complaints?format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `complaints-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error-message">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="analytics-dashboard">
        <div className="no-data">
          <h3>No Data Available</h3>
          <p>Start by submitting some complaints to see analytics.</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const trendChartData = {
    labels: trends.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: 'New Complaints',
        data: trends.map(t => t.complaints),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Resolved',
        data: trends.map(t => t.resolved),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(stats.complaintsByCategory),
    datasets: [
      {
        data: Object.values(stats.complaintsByCategory),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
          '#F97316',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const priorityChartData = {
    labels: Object.keys(stats.complaintsByPriority),
    datasets: [
      {
        label: 'Complaints by Priority',
        data: Object.values(stats.complaintsByPriority),
        backgroundColor: [
          '#EF4444', // urgent - red
          '#F59E0B', // high - orange
          '#3B82F6', // medium - blue
          '#10B981', // low - green
        ],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div className="dashboard-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="time-range-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <div className="export-buttons">
            <button onClick={() => exportData('json')} className="export-btn">
              Export JSON
            </button>
            <button onClick={() => exportData('csv')} className="export-btn">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon total">📊</div>
          <div className="metric-content">
            <h3>Total Complaints</h3>
            <p className="metric-value">{stats.totalComplaints}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon open">⚠️</div>
          <div className="metric-content">
            <h3>Open Complaints</h3>
            <p className="metric-value">{stats.openComplaints}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon resolved">✅</div>
          <div className="metric-content">
            <h3>Resolution Rate</h3>
            <p className="metric-value">{stats.resolutionRate}%</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon time">⏱️</div>
          <div className="metric-content">
            <h3>Avg Resolution Time</h3>
            <p className="metric-value">{stats.averageResolutionTime} days</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon users">👥</div>
          <div className="metric-content">
            <h3>Active Users</h3>
            <p className="metric-value">{stats.userStats.activeUsers}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon new-users">🆕</div>
          <div className="metric-content">
            <h3>New Users (Month)</h3>
            <p className="metric-value">{stats.userStats.newUsersThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Trends Chart */}
        <div className="chart-container">
          <h3>Complaint Trends</h3>
          <Line 
            data={trendChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* Category Distribution */}
        <div className="chart-container">
          <h3>Complaints by Category</h3>
          <Doughnut 
            data={categoryChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
              },
            }}
          />
        </div>

        {/* Priority Distribution */}
        <div className="chart-container">
          <h3>Complaints by Priority</h3>
          <Bar 
            data={priorityChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* Top Departments */}
        <div className="chart-container">
          <h3>Top Departments</h3>
          <Bar 
            data={{
              labels: stats.topDepartments.map(d => d._id),
              datasets: [{
                label: 'Complaints',
                data: stats.topDepartments.map(d => d.count),
                backgroundColor: '#3B82F6',
                borderColor: '#2563EB',
                borderWidth: 1,
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                {activity.status === 'open' && '⚠️'}
                {activity.status === 'in_progress' && '🔄'}
                {activity.status === 'resolved' && '✅'}
              </div>
              <div className="activity-content">
                <p className="activity-description">{activity.description}</p>
                <p className="activity-meta">
                  {activity.user} • {activity.category} • {activity.priority} priority
                </p>
                <p className="activity-time">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 
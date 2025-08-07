import React, { useState, useEffect } from 'react';
import { Complaint } from '../../../shared/types/complaint';
import ComplaintCard from './ComplaintCard';
import DashboardFilters from './DashboardFilters';
import './Dashboard.css';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, filters]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/complaints');
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please check if the server is running.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to fetch complaints (${response.status})`);
        }
      }
      
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...complaints];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === filters.status);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === filters.category);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === filters.priority);
    }

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(complaint =>
        complaint.user.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        complaint.department.toLowerCase().includes(searchTerm) ||
        complaint.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    }

    setFilteredComplaints(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const getStats = () => {
    const total = complaints.length;
    const open = complaints.filter(c => c.status === 'open').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const urgent = complaints.filter(c => c.priority === 'urgent').length;

    return { total, open, inProgress, resolved, urgent };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className={`dashboard ${className}`}>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard ${className}`}>
        <div className="dashboard-error">
          <span className="error-icon">⚠️</span>
          <h3>Error Loading Dashboard</h3>
          <p>Failed to fetch dashboard data. Please check your connection and try again.</p>
          <button onClick={fetchComplaints} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${className}`}>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>📊 Complaint Dashboard</h2>
          <p>Monitor and manage all civic complaints</p>
        </div>
        <button onClick={fetchComplaints} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Complaints</p>
          </div>
        </div>
        <div className="stat-card open">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <h3>{stats.open}</h3>
            <p>Open</p>
          </div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-icon">🔵</div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
        <div className="stat-card urgent">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>{stats.urgent}</h3>
            <p>Urgent</p>
          </div>
        </div>
      </div>

      <DashboardFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        totalComplaints={complaints.length}
        filteredComplaints={filteredComplaints.length}
      />

      <div className="complaints-section">
        <div className="complaints-header">
          <h3>Complaints ({filteredComplaints.length})</h3>
          {filteredComplaints.length === 0 && complaints.length > 0 && (
            <p className="no-results">No complaints match your filters</p>
          )}
        </div>

        {filteredComplaints.length === 0 && complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Complaints Yet</h3>
            <p>Submit your first complaint to get started!</p>
          </div>
        ) : (
          <div className="complaints-grid">
            {filteredComplaints.map(complaint => (
              <ComplaintCard 
                key={complaint.id} 
                complaint={complaint}
                onStatusUpdate={fetchComplaints}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
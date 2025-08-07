import React, { useState } from 'react';
import './DashboardFilters.css';

interface DashboardFiltersProps {
  filters: {
    status: string;
    category: string;
    priority: string;
    search: string;
  };
  onFilterChange: (filters: any) => void;
  totalComplaints: number;
  filteredComplaints: number;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFilterChange,
  totalComplaints,
  filteredComplaints
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      status: 'all',
      category: 'all',
      priority: 'all',
      search: ''
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.category !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.search.trim() !== '';

  return (
    <div className="dashboard-filters">
      <div className="filters-header">
        <div className="filters-info">
          <h4>🔍 Filters & Search</h4>
          <p>
            Showing {filteredComplaints} of {totalComplaints} complaints
            {hasActiveFilters && (
              <span className="active-filters-indicator">
                (filtered)
              </span>
            )}
          </p>
        </div>
        
        <div className="filters-actions">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              🗑️ Clear Filters
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="toggle-filters-btn"
          >
            {showFilters ? '🔽 Hide Filters' : '🔼 Show Filters'}
          </button>
        </div>
      </div>

      <div className={`filters-content ${showFilters ? 'show' : ''}`}>
        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, description, department, or keywords..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="clear-search-btn"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="open">🟡 Open</option>
              <option value="in_progress">🔵 In Progress</option>
              <option value="resolved">🟢 Resolved</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="roads">🛣️ Roads</option>
              <option value="garbage">🗑️ Garbage</option>
              <option value="water">💧 Water</option>
              <option value="electricity">⚡ Electricity</option>
              <option value="sewage">🚽 Sewage</option>
              <option value="traffic">🚦 Traffic</option>
              <option value="streetlight">💡 Streetlight</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">Priority</label>
            <select
              id="priority-filter"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="active-filters">
            <h5>Active Filters:</h5>
            <div className="filter-tags">
              {filters.status !== 'all' && (
                <span className="filter-tag">
                  Status: {filters.status}
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className="remove-filter"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="filter-tag">
                  Category: {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', 'all')}
                    className="remove-filter"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.priority !== 'all' && (
                <span className="filter-tag">
                  Priority: {filters.priority}
                  <button
                    onClick={() => handleFilterChange('priority', 'all')}
                    className="remove-filter"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.search.trim() && (
                <span className="filter-tag">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="remove-filter"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFilters; 
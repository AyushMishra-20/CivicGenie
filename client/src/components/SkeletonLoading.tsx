import React from 'react';
import { motion } from 'framer-motion';
import './SkeletonLoading.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <motion.div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius
      }}
      animate={{
        background: [
          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};

// Complaint Card Skeleton
export const ComplaintCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <Skeleton width="60%" height="18px" />
        <Skeleton width="80px" height="16px" />
      </div>
      <div className="skeleton-card-content">
        <Skeleton width="100%" height="16px" />
        <Skeleton width="90%" height="16px" />
        <Skeleton width="70%" height="16px" />
      </div>
      <div className="skeleton-card-footer">
        <Skeleton width="100px" height="32px" borderRadius="16px" />
        <Skeleton width="60px" height="16px" />
      </div>
    </div>
  );
};

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-stats">
        <div className="skeleton-stat">
          <Skeleton width="60px" height="60px" borderRadius="50%" />
          <div className="skeleton-stat-content">
            <Skeleton width="80px" height="16px" />
            <Skeleton width="40px" height="20px" />
          </div>
        </div>
        <div className="skeleton-stat">
          <Skeleton width="60px" height="60px" borderRadius="50%" />
          <div className="skeleton-stat-content">
            <Skeleton width="80px" height="16px" />
            <Skeleton width="40px" height="20px" />
          </div>
        </div>
        <div className="skeleton-stat">
          <Skeleton width="60px" height="60px" borderRadius="50%" />
          <div className="skeleton-stat-content">
            <Skeleton width="80px" height="16px" />
            <Skeleton width="40px" height="20px" />
          </div>
        </div>
      </div>
      <div className="skeleton-chart">
        <Skeleton width="100%" height="200px" borderRadius="8px" />
      </div>
      <div className="skeleton-list">
        {[1, 2, 3].map((i) => (
          <ComplaintCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC = () => {
  return (
    <div className="skeleton-form">
      <Skeleton width="100%" height="48px" borderRadius="8px" />
      <Skeleton width="100%" height="120px" borderRadius="8px" />
      <Skeleton width="100%" height="48px" borderRadius="8px" />
      <Skeleton width="100%" height="48px" borderRadius="8px" />
      <Skeleton width="120px" height="48px" borderRadius="8px" />
    </div>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <Skeleton width="100%" height="16px" />
          <Skeleton width="80%" height="14px" />
          <Skeleton width="60%" height="14px" />
        </div>
      ))}
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="100%" height="40px" />
        ))}
      </div>
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table-row">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} width="100%" height="48px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="skeleton-profile">
      <div className="skeleton-profile-header">
        <Skeleton width="80px" height="80px" borderRadius="50%" />
        <div className="skeleton-profile-info">
          <Skeleton width="150px" height="24px" />
          <Skeleton width="100px" height="16px" />
        </div>
      </div>
      <div className="skeleton-profile-stats">
        <div className="skeleton-stat">
          <Skeleton width="40px" height="20px" />
          <Skeleton width="60px" height="14px" />
        </div>
        <div className="skeleton-stat">
          <Skeleton width="40px" height="20px" />
          <Skeleton width="60px" height="14px" />
        </div>
        <div className="skeleton-stat">
          <Skeleton width="40px" height="20px" />
          <Skeleton width="60px" height="14px" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;

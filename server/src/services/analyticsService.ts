import { Complaint } from '../models/Complaint';
import { User } from '../models/User';

export interface DashboardStats {
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

export interface TrendData {
  date: string;
  complaints: number;
  resolved: number;
}

export interface DepartmentPerformance {
  department: string;
  totalComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  resolutionRate: number;
  avgPriority: number;
}

class AnalyticsService {
  // Get comprehensive dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get complaint counts by status
      const [totalComplaints, openComplaints, inProgressComplaints, resolvedComplaints] = await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: 'open' }),
        Complaint.countDocuments({ status: 'in_progress' }),
        Complaint.countDocuments({ status: 'resolved' })
      ]);

      // Calculate resolution rate
      const resolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

      // Get complaints by category
      const complaintsByCategory = await Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get complaints by priority
      const complaintsByPriority = await Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get complaints by status
      const complaintsByStatus = await Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get recent activity (last 10 complaints)
      const recentActivity = await Complaint.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('user description category status priority createdAt')
        .lean();

      // Get top departments by complaint count
      const topDepartments = await Complaint.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Get user statistics
      const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        })
      ]);

      // Calculate average resolution time (for resolved complaints)
      const resolvedComplaintsData = await Complaint.find({ status: 'resolved' })
        .select('createdAt updatedAt')
        .lean();

      let totalResolutionTime = 0;
      let resolvedCount = 0;

      resolvedComplaintsData.forEach(complaint => {
        const resolutionTime = new Date(complaint.updatedAt).getTime() - new Date(complaint.createdAt).getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      });

      const averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

      // Convert arrays to objects for easier frontend consumption
      const categoryObj = complaintsByCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);

      const priorityObj = complaintsByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);

      const statusObj = complaintsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalComplaints,
        openComplaints,
        inProgressComplaints,
        resolvedComplaints,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        averageResolutionTime: Math.round(averageResolutionTime / (1000 * 60 * 60 * 24) * 100) / 100, // Convert to days
        complaintsByCategory: categoryObj,
        complaintsByPriority: priorityObj,
        complaintsByStatus: statusObj,
        recentActivity,
        topDepartments,
        userStats: {
          totalUsers,
          activeUsers,
          newUsersThisMonth
        }
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  // Get complaint trends over time
  async getComplaintTrends(days: number = 30): Promise<TrendData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            complaints: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      return trends.map(trend => ({
        date: trend._id,
        complaints: trend.complaints,
        resolved: trend.resolved
      }));
    } catch (error) {
      console.error('Error getting complaint trends:', error);
      throw new Error('Failed to get complaint trends');
    }
  }

  // Get department performance metrics
  async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
    try {
      const performance = await Complaint.aggregate([
        {
          $group: {
            _id: '$department',
            totalComplaints: { $sum: 1 },
            resolvedComplaints: {
              $sum: {
                $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
              }
            },
            avgResolutionTime: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'resolved'] },
                  { $subtract: ['$updatedAt', '$createdAt'] },
                  null
                ]
              }
            },
            avgPriority: {
              $avg: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$priority', 'urgent'] }, then: 4 },
                    { case: { $eq: ['$priority', 'high'] }, then: 3 },
                    { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                    { case: { $eq: ['$priority', 'low'] }, then: 1 }
                  ],
                  default: 2
                }
              }
            }
          }
        },
        {
          $addFields: {
            resolutionRate: {
              $multiply: [
                { $divide: ['$resolvedComplaints', '$totalComplaints'] },
                100
              ]
            },
            averageResolutionTime: {
              $divide: ['$avgResolutionTime', 1000 * 60 * 60 * 24] // Convert to days
            }
          }
        },
        {
          $sort: { totalComplaints: -1 }
        }
      ]);

      return performance.map(dept => ({
        department: dept._id,
        totalComplaints: dept.totalComplaints,
        resolvedComplaints: dept.resolvedComplaints,
        averageResolutionTime: Math.round(dept.averageResolutionTime * 100) / 100,
        resolutionRate: Math.round(dept.resolutionRate * 100) / 100,
        avgPriority: Math.round(dept.avgPriority * 100) / 100
      }));
    } catch (error) {
      console.error('Error getting department performance:', error);
      throw new Error('Failed to get department performance');
    }
  }

  // Get user activity statistics
  async getUserActivityStats(): Promise<any> {
    try {
      const userStats = await Complaint.aggregate([
        {
          $group: {
            _id: '$user',
            complaintCount: { $sum: 1 },
            lastComplaint: { $max: '$createdAt' },
            avgPriority: {
              $avg: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$priority', 'urgent'] }, then: 4 },
                    { case: { $eq: ['$priority', 'high'] }, then: 3 },
                    { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                    { case: { $eq: ['$priority', 'low'] }, then: 1 }
                  ],
                  default: 2
                }
              }
            }
          }
        },
        {
          $sort: { complaintCount: -1 }
        },
        {
          $limit: 10
        }
      ]);

      return userStats;
    } catch (error) {
      console.error('Error getting user activity stats:', error);
      throw new Error('Failed to get user activity statistics');
    }
  }

  // Get location-based statistics
  async getLocationStats(): Promise<any> {
    try {
      const locationStats = await Complaint.aggregate([
        {
          $group: {
            _id: '$location.city',
            complaintCount: { $sum: 1 },
            avgLatitude: { $avg: '$location.latitude' },
            avgLongitude: { $avg: '$location.longitude' }
          }
        },
        {
          $sort: { complaintCount: -1 }
        }
      ]);

      return locationStats;
    } catch (error) {
      console.error('Error getting location stats:', error);
      throw new Error('Failed to get location statistics');
    }
  }
}

export default new AnalyticsService(); 
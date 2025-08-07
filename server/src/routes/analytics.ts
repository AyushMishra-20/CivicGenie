import express from 'express';
import AnalyticsService from '../services/analyticsService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Complaint } from '../models/Complaint';

const router = express.Router();

// Get comprehensive dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const stats = await AnalyticsService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      message: 'Unable to load dashboard data'
    });
  }
});

// Get complaint trends over time
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await AnalyticsService.getComplaintTrends(days);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching complaint trends:', error);
    res.status(500).json({ 
      error: 'Failed to fetch complaint trends',
      message: 'Unable to load trend data'
    });
  }
});

// Get department performance metrics
router.get('/departments', authenticateToken, async (req, res) => {
  try {
    const performance = await AnalyticsService.getDepartmentPerformance();
    res.json(performance);
  } catch (error) {
    console.error('Error fetching department performance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch department performance',
      message: 'Unable to load department data'
    });
  }
});

// Get user activity statistics
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const userStats = await AnalyticsService.getUserActivityStats();
    res.json(userStats);
  } catch (error) {
    console.error('Error fetching user activity stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user activity statistics',
      message: 'Unable to load user data'
    });
  }
});

// Get location-based statistics
router.get('/locations', authenticateToken, async (req, res) => {
  try {
    const locationStats = await AnalyticsService.getLocationStats();
    res.json(locationStats);
  } catch (error) {
    console.error('Error fetching location stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch location statistics',
      message: 'Unable to load location data'
    });
  }
});

// Get export data for complaints (admin only)
router.get('/export/complaints', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, status, category } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Get complaints with filters
    const complaints = await Complaint.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'ID', 'User', 'Description', 'Category', 'Status', 'Priority',
        'Department', 'Created At', 'Updated At', 'Location'
      ];
      
      const csvData = complaints.map(complaint => [
        complaint._id,
        complaint.user,
        complaint.description,
        complaint.category,
        complaint.status,
        complaint.priority,
        complaint.department,
        complaint.createdAt,
        complaint.updatedAt,
        `${complaint.location.city}, ${complaint.location.state}`
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({
        total: complaints.length,
        complaints,
        exportDate: new Date().toISOString(),
        filters: { startDate, endDate, status, category }
      });
    }
  } catch (error) {
    console.error('Error exporting complaints:', error);
    res.status(500).json({ 
      error: 'Failed to export complaints',
      message: 'Unable to generate export data'
    });
  }
});

// Get real-time statistics (for dashboard widgets)
router.get('/realtime', authenticateToken, async (req, res) => {
  try {
    const [totalComplaints, openComplaints, resolvedToday] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      Complaint.countDocuments({
        status: 'resolved',
        updatedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    res.json({
      totalComplaints,
      openComplaints,
      resolvedToday,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch real-time statistics',
      message: 'Unable to load real-time data'
    });
  }
});

export default router; 
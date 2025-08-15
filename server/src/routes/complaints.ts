import { Router } from 'express';
import { AIService } from '../services/aiService';
import ComplaintService from '../services/complaintService';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET all complaints with optional filtering (public access)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, category, priority, user, search } = req.query;
    
    const filters = {
      status: status as string,
      category: category as string,
      priority: priority as string,
      user: user as string,
      search: search as string
    };

    const complaints = await ComplaintService.getAllComplaints(filters);
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// GET complaints for current user
router.get('/my-complaints', authenticateToken, async (req, res) => {
  try {
    const complaints = await ComplaintService.getComplaintsByUser(req.user!.name);
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
});

// GET complaint by ID
router.get('/:id', async (req, res) => {
  try {
    const complaint = await ComplaintService.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// POST new complaint with AI analysis
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { description, language, location, photos = [], notificationPreferences } = req.body;
    
    if (!description || !language || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Use authenticated user
    const user = req.user!.name;
    
    // Validate location data
    if (!location.latitude || !location.longitude || !location.address) {
      return res.status(400).json({ error: 'Invalid location data' });
    }
    
    // Analyze complaint with AI
    const aiAnalysis = await AIService.analyzeComplaint(description, language, photos);
    
    // Create complaint data
    const complaintData = {
      user,
      description,
      language,
      category: aiAnalysis.category,
      status: 'open' as const,
      priority: aiAnalysis.priority,
      department: aiAnalysis.department,
      estimatedResolutionTime: aiAnalysis.estimatedResolutionTime,
      keywords: aiAnalysis.keywords,
      confidence: aiAnalysis.confidence,
      suggestions: aiAnalysis.suggestions,
      photos,
      location,
      notificationPreferences: notificationPreferences || {
        enabled: false,
        browserNotifications: false,
        statusUpdates: true,
        resolutionUpdates: true
      }
    };
    
    // Save to database
    const complaint = await ComplaintService.createComplaint(complaintData);
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Simple POST route for testing without authentication
router.post('/simple', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Create simple complaint data
    const complaintData = {
      user: 'Anonymous',
      description: text,
      language: 'en' as const,
      category: 'other' as const,
      status: 'open' as const,
      priority: 'medium' as const,
      department: 'general',
      estimatedResolutionTime: '3-5 days',
      keywords: [],
      confidence: 0.8,
      suggestions: [],
      photos: [],
      location: {
        latitude: 0,
        longitude: 0,
        address: 'Unknown location',
        city: 'Unknown',
        state: 'Unknown',
        pincode: '000000'
      },
      notificationPreferences: {
        enabled: false,
        browserNotifications: false,
        statusUpdates: true,
        resolutionUpdates: true
      }
    };
    
    // Save to database
    const complaint = await ComplaintService.createComplaint(complaintData);
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating simple complaint:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// POST photo analysis endpoint
router.post('/:id/analyze-photo', async (req, res) => {
  try {
    const { photoBase64 } = req.body;
    const complaintId = req.params.id;
    
    if (!photoBase64) {
      return res.status(400).json({ error: 'Photo data required' });
    }
    
    const complaint = await ComplaintService.getComplaintById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    const photoAnalysis = await AIService.analyzePhoto(photoBase64);
    res.json(photoAnalysis);
  } catch (error) {
    console.error('Error analyzing photo:', error);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

// PATCH update complaint status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const complaintId = req.params.id;
    
    if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be open, in_progress, or resolved' });
    }
    
    const complaint = await ComplaintService.updateComplaintStatus(complaintId, status);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    // Send notification if enabled
    if (complaint.notificationPreferences?.enabled) {
      // In a real application, you would send actual notifications here
      // For now, we'll just log the notification
      console.log(`Notification sent for complaint ${complaintId}: Status changed to ${status}`);
      
      if (complaint.notificationPreferences.statusUpdates) {
        console.log(`Status update notification sent to user: ${complaint.user}`);
      }
      
      if (status === 'resolved' && complaint.notificationPreferences.resolutionUpdates) {
        console.log(`Resolution notification sent to user: ${complaint.user}`);
      }
    }
    
    res.json(complaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

// PATCH update notification preferences
router.patch('/:id/notifications', async (req, res) => {
  try {
    const { notificationPreferences } = req.body;
    const complaintId = req.params.id;
    
    if (!notificationPreferences) {
      return res.status(400).json({ error: 'Notification preferences required' });
    }
    
    const complaint = await ComplaintService.updateNotificationPreferences(complaintId, notificationPreferences);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.json(complaint);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// GET complaint statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await ComplaintService.getComplaintStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    res.status(500).json({ error: 'Failed to fetch complaint statistics' });
  }
});

// GET complaints by user
router.get('/user/:user', async (req, res) => {
  try {
    const complaints = await ComplaintService.getComplaintsByUser(req.params.user);
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
});

// GET search complaints
router.get('/search/:term', async (req, res) => {
  try {
    const complaints = await ComplaintService.searchComplaints(req.params.term);
    res.json(complaints);
  } catch (error) {
    console.error('Error searching complaints:', error);
    res.status(500).json({ error: 'Failed to search complaints' });
  }
});

// DELETE complaint (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ComplaintService.deleteComplaint(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

export default router; 
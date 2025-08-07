import { Router } from 'express';
import { AIService } from '../services/aiService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { ComplaintService } from '../services/complaintService';

const router = Router();

// AI Chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await AIService.chatWithAI(message, context);
    res.json(response);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Predictive analytics endpoint
router.get('/analytics/predictive', authenticateToken, requireRole(['admin', 'department']), async (req, res) => {
  try {
    const { startDate, endDate, category, location } = req.query;
    
    // Get complaints for analysis
    const complaints = await ComplaintService.getAllComplaints({
      category: category as string
    });
    
    const analysis = await AIService.analyzeTrends(complaints);
    res.json(analysis);
  } catch (error) {
    console.error('Predictive analytics error:', error);
    res.status(500).json({ error: 'Failed to generate predictive analytics' });
  }
});

// Smart routing endpoint
router.post('/routing', authenticateToken, async (req, res) => {
  try {
    const { analysis, location } = req.body;
    
    if (!analysis || !location) {
      return res.status(400).json({ error: 'Analysis and location are required' });
    }
    
    const routing = await AIService.routeComplaint(analysis, location);
    res.json(routing);
  } catch (error) {
    console.error('Smart routing error:', error);
    res.status(500).json({ error: 'Failed to process routing request' });
  }
});

// Enhanced photo analysis endpoint
router.post('/photo-analysis', authenticateToken, async (req, res) => {
  try {
    const { photoBase64 } = req.body;
    
    if (!photoBase64) {
      return res.status(400).json({ error: 'Photo data is required' });
    }
    
    const analysis = await AIService.analyzePhoto(photoBase64);
    res.json(analysis);
  } catch (error) {
    console.error('Photo analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

// AI model status endpoint
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      models: ['gpt-4o', 'claude-3-sonnet'],
      features: [
        'complaint-analysis',
        'photo-analysis',
        'chat-assistant',
        'predictive-analytics',
        'smart-routing'
      ]
    };
    
    res.json(status);
  } catch (error) {
    console.error('AI status error:', error);
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

export default router; 
import { Complaint, IComplaint } from '../models/Complaint';
import { Complaint as ComplaintType } from '../../../shared/types/complaint';
import mongoose from 'mongoose';

// Fallback in-memory storage
let inMemoryComplaints: any[] = [];
let useInMemory = false;

// Check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

export class ComplaintService {
  // Create a new complaint
  static async createComplaint(complaintData: Partial<IComplaint>): Promise<IComplaint> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        const complaint = {
          _id: Date.now().toString(),
          ...complaintData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryComplaints.push(complaint);
        return complaint as IComplaint;
      }

      const complaint = new Complaint(complaintData);
      const savedComplaint = await complaint.save();
      return savedComplaint;
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw new Error('Failed to create complaint');
    }
  }

  // Get all complaints with optional filtering
  static async getAllComplaints(filters: {
    status?: string;
    category?: string;
    priority?: string;
    user?: string;
    search?: string;
  } = {}): Promise<IComplaint[]> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        let complaints = [...inMemoryComplaints];

        // Apply filters
        if (filters.status) {
          complaints = complaints.filter(c => c.status === filters.status);
        }
        if (filters.category) {
          complaints = complaints.filter(c => c.category === filters.category);
        }
        if (filters.priority) {
          complaints = complaints.filter(c => c.priority === filters.priority);
        }
        if (filters.user) {
          complaints = complaints.filter(c => 
            c.user.toLowerCase().includes(filters.user!.toLowerCase())
          );
        }
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          complaints = complaints.filter(c => 
            c.description.toLowerCase().includes(searchTerm) ||
            c.user.toLowerCase().includes(searchTerm) ||
            c.location.address.toLowerCase().includes(searchTerm) ||
            c.keywords.some((k: string) => k.toLowerCase().includes(searchTerm))
          );
        }

        return complaints.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      const query: any = {};

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.category) query.category = filters.category;
      if (filters.priority) query.priority = filters.priority;
      if (filters.user) query.user = { $regex: filters.user, $options: 'i' };

      // Search functionality
      if (filters.search) {
        query.$or = [
          { description: { $regex: filters.search, $options: 'i' } },
          { user: { $regex: filters.search, $options: 'i' } },
          { 'location.address': { $regex: filters.search, $options: 'i' } },
          { keywords: { $in: [new RegExp(filters.search, 'i')] } }
        ];
      }

      const complaints = await Complaint.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return complaints;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw new Error('Failed to fetch complaints');
    }
  }

  // Get complaint by ID
  static async getComplaintById(id: string): Promise<IComplaint | null> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        return inMemoryComplaints.find(c => c._id === id) || null;
      }

      const complaint = await Complaint.findById(id).lean();
      return complaint;
    } catch (error) {
      console.error('Error fetching complaint by ID:', error);
      throw new Error('Failed to fetch complaint');
    }
  }

  // Update complaint status
  static async updateComplaintStatus(id: string, status: string): Promise<IComplaint | null> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        const complaint = inMemoryComplaints.find(c => c._id === id);
        if (complaint) {
          complaint.status = status;
          complaint.updatedAt = new Date();
          return complaint;
        }
        return null;
      }

      const complaint = await Complaint.findByIdAndUpdate(
        id,
        { 
          status,
          updatedAt: new Date()
        },
        { new: true }
      ).lean();

      return complaint;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw new Error('Failed to update complaint status');
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(
    id: string, 
    notificationPreferences: any
  ): Promise<IComplaint | null> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        const complaint = inMemoryComplaints.find(c => c._id === id);
        if (complaint) {
          complaint.notificationPreferences = notificationPreferences;
          complaint.updatedAt = new Date();
          return complaint;
        }
        return null;
      }

      const complaint = await Complaint.findByIdAndUpdate(
        id,
        { 
          notificationPreferences,
          updatedAt: new Date()
        },
        { new: true }
      ).lean();

      return complaint;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  // Get complaint statistics
  static async getComplaintStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        const complaints = inMemoryComplaints;
        
        const stats = {
          total: complaints.length,
          open: complaints.filter(c => c.status === 'open').length,
          inProgress: complaints.filter(c => c.status === 'in_progress').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          byCategory: {} as Record<string, number>,
          byPriority: {} as Record<string, number>
        };

        // Calculate category stats
        complaints.forEach(c => {
          stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
          stats.byPriority[c.priority] = (stats.byPriority[c.priority] || 0) + 1;
        });

        return stats;
      }

      const stats = await Complaint.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            open: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
            },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
            }
          }
        }
      ]);

      const categoryStats = await Complaint.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);

      const priorityStats = await Complaint.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]);

      const byCategory: Record<string, number> = {};
      categoryStats.forEach(stat => {
        byCategory[stat._id] = stat.count;
      });

      const byPriority: Record<string, number> = {};
      priorityStats.forEach(stat => {
        byPriority[stat._id] = stat.count;
      });

      return {
        total: stats[0]?.total || 0,
        open: stats[0]?.open || 0,
        inProgress: stats[0]?.inProgress || 0,
        resolved: stats[0]?.resolved || 0,
        byCategory,
        byPriority
      };
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
      throw new Error('Failed to fetch complaint statistics');
    }
  }

  // Delete complaint (admin only)
  static async deleteComplaint(id: string): Promise<boolean> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        const index = inMemoryComplaints.findIndex(c => c._id === id);
        if (index !== -1) {
          inMemoryComplaints.splice(index, 1);
          return true;
        }
        return false;
      }

      const result = await Complaint.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting complaint:', error);
      throw new Error('Failed to delete complaint');
    }
  }

  // Get complaints by user
  static async getComplaintsByUser(user: string): Promise<IComplaint[]> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        return inMemoryComplaints
          .filter(c => c.user.toLowerCase().includes(user.toLowerCase()))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const complaints = await Complaint.find({ user })
        .sort({ createdAt: -1 })
        .lean();

      return complaints;
    } catch (error) {
      console.error('Error fetching user complaints:', error);
      throw new Error('Failed to fetch user complaints');
    }
  }

  // Search complaints
  static async searchComplaints(searchTerm: string): Promise<IComplaint[]> {
    try {
      if (!isDatabaseConnected()) {
        useInMemory = true;
        const term = searchTerm.toLowerCase();
        return inMemoryComplaints.filter(c => 
          c.description.toLowerCase().includes(term) ||
          c.user.toLowerCase().includes(term) ||
          c.location.address.toLowerCase().includes(term) ||
          c.keywords.some((k: string) => k.toLowerCase().includes(term))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const complaints = await Complaint.find({
        $or: [
          { description: { $regex: searchTerm, $options: 'i' } },
          { user: { $regex: searchTerm, $options: 'i' } },
          { 'location.address': { $regex: searchTerm, $options: 'i' } },
          { keywords: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();

      return complaints;
    } catch (error) {
      console.error('Error searching complaints:', error);
      throw new Error('Failed to search complaints');
    }
  }
}

export default ComplaintService; 
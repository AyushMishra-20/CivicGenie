import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  user: string;
  description: string;
  language: 'en' | 'hi' | 'mr';
  category: 'roads' | 'garbage' | 'water' | 'electricity' | 'sewage' | 'traffic' | 'streetlight' | 'other';
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  estimatedResolutionTime: string;
  keywords: string[];
  confidence: number;
  suggestions: string[];
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  notificationPreferences: {
    enabled: boolean;
    email?: string;
    phone?: string;
    browserNotifications: boolean;
    statusUpdates: boolean;
    resolutionUpdates: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true }
}, { _id: false });

const NotificationPreferencesSchema = new Schema({
  enabled: { type: Boolean, default: false },
  email: { type: String },
  phone: { type: String },
  browserNotifications: { type: Boolean, default: false },
  statusUpdates: { type: Boolean, default: true },
  resolutionUpdates: { type: Boolean, default: true }
}, { _id: false });

const ComplaintSchema = new Schema<IComplaint>({
  user: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  language: { 
    type: String, 
    required: true,
    enum: ['en', 'hi', 'mr'],
    default: 'en'
  },
  category: { 
    type: String, 
    required: true,
    enum: ['roads', 'garbage', 'water', 'electricity', 'sewage', 'traffic', 'streetlight', 'other'],
    default: 'other'
  },
  status: { 
    type: String, 
    required: true,
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open'
  },
  priority: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  department: { 
    type: String, 
    required: true,
    trim: true 
  },
  estimatedResolutionTime: { 
    type: String, 
    required: true 
  },
  keywords: [{ 
    type: String, 
    trim: true 
  }],
  confidence: { 
    type: Number, 
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  suggestions: [{ 
    type: String, 
    trim: true 
  }],
  photos: [{ 
    type: String 
  }],
  location: { 
    type: LocationSchema, 
    required: true 
  },
  notificationPreferences: { 
    type: NotificationPreferencesSchema, 
    default: () => ({
      enabled: false,
      browserNotifications: false,
      statusUpdates: true,
      resolutionUpdates: true
    })
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ category: 1, status: 1 });
ComplaintSchema.index({ priority: 1, status: 1 });
ComplaintSchema.index({ 'location.city': 1, status: 1 });
ComplaintSchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted ID
ComplaintSchema.virtual('formattedId').get(function() {
  return (this._id as any).toString().slice(-8).toUpperCase();
});

// Pre-save middleware to ensure required fields
ComplaintSchema.pre('save', function(next) {
  if (!this.notificationPreferences) {
    this.notificationPreferences = {
      enabled: false,
      browserNotifications: false,
      statusUpdates: true,
      resolutionUpdates: true
    };
  }
  next();
});

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint; 
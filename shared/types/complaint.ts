export interface Complaint {
  id: string;
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
  notificationPreferences: NotificationPreferencesData;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferencesData {
  enabled: boolean;
  email?: string;
  phone?: string;
  browserNotifications: boolean;
  statusUpdates: boolean;
  resolutionUpdates: boolean;
} 
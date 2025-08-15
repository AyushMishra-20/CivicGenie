export interface Complaint {
  id: string;
  text: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photos?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateComplaintRequest {
  text: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photos?: string[];
} 
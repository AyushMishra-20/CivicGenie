import { Complaint } from '../../../shared/types/complaint';
import { LocationData } from '../utils/locationService';
import { NotificationPreferencesData } from '../utils/notificationService';

export interface SubmitComplaintInput {
  user: string;
  description: string;
  language: 'en' | 'hi' | 'mr';
  location: LocationData;
  photos?: string[];
  notificationPreferences?: NotificationPreferencesData;
}

export async function submitComplaint(input: SubmitComplaintInput): Promise<Complaint> {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to submit complaint');
  return res.json();
} 
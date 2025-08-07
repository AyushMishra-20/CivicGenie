export interface NotificationPreferencesData {
  enabled: boolean;
  email?: string;
  phone?: string;
  browserNotifications: boolean;
  statusUpdates: boolean;
  resolutionUpdates: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async sendNotification(title: string, options?: NotificationOptions): Promise<boolean> {
    if (!('Notification' in window) || this.permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async sendComplaintStatusUpdate(complaintId: string, status: string, title?: string): Promise<boolean> {
    const defaultTitle = `Complaint #${complaintId} Status Updated`;
    const body = `Your complaint status has been updated to: ${status}`;
    
    return this.sendNotification(title || defaultTitle, {
      body,
      tag: `complaint-${complaintId}`,
      data: { complaintId, status }
    });
  }

  async sendComplaintResolution(complaintId: string, resolution?: string): Promise<boolean> {
    const title = `Complaint #${complaintId} Resolved!`;
    const body = resolution || 'Your complaint has been resolved successfully.';
    
    return this.sendNotification(title, {
      body,
      tag: `complaint-${complaintId}`,
      data: { complaintId, type: 'resolution' }
    });
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  canSendNotifications(): boolean {
    return this.isSupported() && this.permission === 'granted';
  }
}

export default NotificationService; 
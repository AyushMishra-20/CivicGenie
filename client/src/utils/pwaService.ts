export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NotificationPermission {
  granted: boolean;
  permission: NotificationPermission;
}

export interface OfflineComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  photos?: string[];
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}

class PWAService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onOffline();
    });

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as PWAInstallPrompt;
      this.dispatchEvent('installPromptAvailable');
    });

    // Register service worker
    await this.registerServiceWorker();
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.swRegistration);

      // Listen for service worker updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.dispatchEvent('updateAvailable');
            }
          });
        }
      });

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.dispatchEvent('swUpdated');
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Install prompt methods
  public getInstallPrompt(): PWAInstallPrompt | null {
    return this.installPrompt;
  }

  public async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      this.installPrompt = null;
      return choice.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  // Push notification methods
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return { granted: false, permission: 'denied' as NotificationPermission };
    }

    if (Notification.permission === 'granted') {
      return { granted: true, permission: 'granted' };
    }

    if (Notification.permission === 'denied') {
      return { granted: false, permission: 'denied' };
    }

    try {
      const permission = await Notification.requestPermission();
      return { granted: permission === 'granted', permission };
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return { granted: false, permission: 'denied' as NotificationPermission };
    }
  }

  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return null;
    }

    const permission = await this.requestNotificationPermission();
    if (!permission.granted) {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  public async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  // Offline functionality
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public async saveOfflineComplaint(complaint: Omit<OfflineComplaint, 'id' | 'timestamp' | 'status'>): Promise<string> {
    const offlineComplaint: OfflineComplaint = {
      ...complaint,
      id: this.generateId(),
      timestamp: Date.now(),
      status: 'pending'
    };

    try {
      const db = await this.openIndexedDB();
      await db.add('offlineComplaints', offlineComplaint);
      console.log('Complaint saved offline:', offlineComplaint.id);
      return offlineComplaint.id;
    } catch (error) {
      console.error('Failed to save offline complaint:', error);
      throw error;
    }
  }

  public async getOfflineComplaints(): Promise<OfflineComplaint[]> {
    try {
      const db = await this.openIndexedDB();
      return await db.getAll('offlineComplaints');
    } catch (error) {
      console.error('Failed to get offline complaints:', error);
      return [];
    }
  }

  public async syncOfflineComplaints(): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot sync while offline');
      return;
    }

    try {
      const offlineComplaints = await this.getOfflineComplaints();
      const pendingComplaints = offlineComplaints.filter(c => c.status === 'pending');

      for (const complaint of pendingComplaints) {
        try {
          const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(complaint)
          });

          if (response.ok) {
            const db = await this.openIndexedDB();
            await db.delete('offlineComplaints', complaint.id);
            console.log('Synced complaint:', complaint.id);
          } else {
            // Mark as failed
            const db = await this.openIndexedDB();
            await db.put('offlineComplaints', { ...complaint, status: 'failed' });
          }
        } catch (error) {
          console.error('Failed to sync complaint:', complaint.id, error);
          const db = await this.openIndexedDB();
          await db.put('offlineComplaints', { ...complaint, status: 'failed' });
        }
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  // Background sync
  public async registerBackgroundSync(): Promise<void> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      console.warn('Background sync not supported');
      return;
    }

    try {
      await this.swRegistration.sync.register('background-sync-complaints');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  // Cache management
  public async clearCache(): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache cleared');
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CiviGenieDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('offlineComplaints')) {
          const store = db.createObjectStore('offlineComplaints', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  private onOnline(): void {
    console.log('App is online');
    this.dispatchEvent('online');
    this.syncOfflineComplaints();
  }

  private onOffline(): void {
    console.log('App is offline');
    this.dispatchEvent('offline');
  }

  private dispatchEvent(eventName: string, detail?: any): void {
    window.dispatchEvent(new CustomEvent(`pwa:${eventName}`, { detail }));
  }

  // Public event listeners
  public on(eventName: string, callback: (event: CustomEvent) => void): void {
    window.addEventListener(`pwa:${eventName}`, callback as EventListener);
  }

  public off(eventName: string, callback: (event: CustomEvent) => void): void {
    window.removeEventListener(`pwa:${eventName}`, callback as EventListener);
  }
}

// Export singleton instance
export const pwaService = new PWAService();
export default pwaService; 
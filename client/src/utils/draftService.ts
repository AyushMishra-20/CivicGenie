export interface ComplaintDraft {
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
  lastModified: number;
}

class DraftService {
  private readonly STORAGE_KEY = 'civigenie-drafts';
  private readonly MAX_DRAFTS = 10;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  // Get all drafts
  public getDrafts(): ComplaintDraft[] {
    try {
      const draftsJson = localStorage.getItem(this.STORAGE_KEY);
      if (!draftsJson) return [];
      
      const drafts = JSON.parse(draftsJson);
      return Array.isArray(drafts) ? drafts : [];
    } catch (error) {
      console.error('Failed to get drafts:', error);
      return [];
    }
  }

  // Get a specific draft by ID
  public getDraft(id: string): ComplaintDraft | null {
    const drafts = this.getDrafts();
    return drafts.find(draft => draft.id === id) || null;
  }

  // Save a draft
  public saveDraft(draft: Omit<ComplaintDraft, 'id' | 'timestamp' | 'lastModified'>): string {
    const newDraft: ComplaintDraft = {
      ...draft,
      id: this.generateId(),
      timestamp: Date.now(),
      lastModified: Date.now()
    };

    const drafts = this.getDrafts();
    
    // Remove old drafts if we exceed the limit
    if (drafts.length >= this.MAX_DRAFTS) {
      drafts.sort((a, b) => b.lastModified - a.lastModified);
      drafts.splice(this.MAX_DRAFTS - 1);
    }

    drafts.unshift(newDraft);
    this.saveDrafts(drafts);

    return newDraft.id;
  }

  // Update an existing draft
  public updateDraft(id: string, updates: Partial<ComplaintDraft>): boolean {
    const drafts = this.getDrafts();
    const draftIndex = drafts.findIndex(draft => draft.id === id);
    
    if (draftIndex === -1) return false;

    drafts[draftIndex] = {
      ...drafts[draftIndex],
      ...updates,
      lastModified: Date.now()
    };

    this.saveDrafts(drafts);
    return true;
  }

  // Delete a draft
  public deleteDraft(id: string): boolean {
    const drafts = this.getDrafts();
    const filteredDrafts = drafts.filter(draft => draft.id !== id);
    
    if (filteredDrafts.length === drafts.length) return false;
    
    this.saveDrafts(filteredDrafts);
    return true;
  }

  // Clear all drafts
  public clearDrafts(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Auto-save functionality
  public startAutoSave(
    formData: any,
    onSave: (draftId: string) => void,
    intervalMs: number = 5000
  ): void {
    this.stopAutoSave();
    
    this.autoSaveInterval = setInterval(() => {
      if (this.hasFormData(formData)) {
        const draftId = this.saveDraft(formData);
        onSave(draftId);
      }
    }, intervalMs);
  }

  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Check if form has meaningful data
  private hasFormData(data: any): boolean {
    return data && (
      data.title?.trim() ||
      data.description?.trim() ||
      data.category ||
      data.priority ||
      data.location?.address?.trim() ||
      (data.photos && data.photos.length > 0)
    );
  }

  // Get draft statistics
  public getDraftStats(): {
    total: number;
    oldest: number;
    newest: number;
    totalSize: number;
  } {
    const drafts = this.getDrafts();
    
    if (drafts.length === 0) {
      return { total: 0, oldest: 0, newest: 0, totalSize: 0 };
    }

    const timestamps = drafts.map(d => d.timestamp);
    const totalSize = new Blob([JSON.stringify(drafts)]).size;

    return {
      total: drafts.length,
      oldest: Math.min(...timestamps),
      newest: Math.max(...timestamps),
      totalSize
    };
  }

  // Export drafts
  public exportDrafts(): string {
    const drafts = this.getDrafts();
    return JSON.stringify(drafts, null, 2);
  }

  // Import drafts
  public importDrafts(draftsJson: string): boolean {
    try {
      const drafts = JSON.parse(draftsJson);
      if (!Array.isArray(drafts)) return false;
      
      // Validate draft structure
      const validDrafts = drafts.filter(draft => 
        draft.id && 
        draft.timestamp && 
        draft.lastModified
      );
      
      this.saveDrafts(validDrafts);
      return true;
    } catch (error) {
      console.error('Failed to import drafts:', error);
      return false;
    }
  }

  // Clean up old drafts (older than 30 days)
  public cleanupOldDrafts(): number {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const drafts = this.getDrafts();
    const validDrafts = drafts.filter(draft => draft.lastModified > thirtyDaysAgo);
    
    const removedCount = drafts.length - validDrafts.length;
    if (removedCount > 0) {
      this.saveDrafts(validDrafts);
    }
    
    return removedCount;
  }

  // Search drafts
  public searchDrafts(query: string): ComplaintDraft[] {
    const drafts = this.getDrafts();
    const lowerQuery = query.toLowerCase();
    
    return drafts.filter(draft =>
      draft.title.toLowerCase().includes(lowerQuery) ||
      draft.description.toLowerCase().includes(lowerQuery) ||
      draft.category.toLowerCase().includes(lowerQuery) ||
      draft.location.address.toLowerCase().includes(lowerQuery)
    );
  }

  // Get drafts by category
  public getDraftsByCategory(category: string): ComplaintDraft[] {
    const drafts = this.getDrafts();
    return drafts.filter(draft => draft.category === category);
  }

  // Get recent drafts
  public getRecentDrafts(limit: number = 5): ComplaintDraft[] {
    const drafts = this.getDrafts();
    return drafts
      .sort((a, b) => b.lastModified - a.lastModified)
      .slice(0, limit);
  }

  // Private methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveDrafts(drafts: ComplaintDraft[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to save drafts:', error);
      // If storage is full, try to clean up old drafts
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanupOldDrafts();
        // Try again with cleaned up data
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts));
        } catch (retryError) {
          console.error('Failed to save drafts after cleanup:', retryError);
        }
      }
    }
  }
}

// Export singleton instance
export const draftService = new DraftService();
export default draftService;

import { supabase } from "@/integrations/supabase/client";

export interface StorageConfig {
  provider: 'local' | 'supabase';
  bucket: string;
}

export class StorageService {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  async putObject(path: string, file: File | Blob, contentType?: string): Promise<string> {
    if (this.config.provider === 'supabase') {
      const { data, error } = await supabase.storage
        .from(this.config.bucket)
        .upload(path, file, {
          contentType,
          upsert: true
        });

      if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      return data.path;
    } else {
      // Local storage simulation - return a mock path
      const url = URL.createObjectURL(file);
      return url;
    }
  }

  async getUrl(path: string): Promise<string> {
    if (this.config.provider === 'supabase') {
      const { data } = supabase.storage
        .from(this.config.bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    } else {
      // For local storage, return the path as-is
      return path;
    }
  }

  async list(prefix?: string): Promise<string[]> {
    if (this.config.provider === 'supabase') {
      const { data, error } = await supabase.storage
        .from(this.config.bucket)
        .list(prefix);

      if (error) {
        throw new Error(`Storage list failed: ${error.message}`);
      }

      return data.map(item => item.name);
    } else {
      // Mock for local storage
      return [];
    }
  }

  async delete(path: string): Promise<void> {
    if (this.config.provider === 'supabase') {
      const { error } = await supabase.storage
        .from(this.config.bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Storage delete failed: ${error.message}`);
      }
    }
    // For local storage, we can't actually delete the blob URLs
  }

  // Helper methods for different asset types
  getVoicePath(jobId: string, filename: string): string {
    return `assets/output/audio/${jobId}/${filename}`;
  }

  getVideoPath(jobId: string, type: 'raw' | 'final', filename: string): string {
    return `assets/output/video/${type}/${jobId}/${filename}`;
  }

  getLogPath(jobId: string): string {
    return `logs/pipeline/${jobId}.log`;
  }

  getAvatarPath(filename: string): string {
    return `assets/input/avatars/${filename}`;
  }

  // Generate shareable link with expiration
  async generateShareLink(path: string, expiresIn = 3600): Promise<string> {
    if (this.config.provider === 'supabase') {
      const { data, error } = await supabase.storage
        .from(this.config.bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw new Error(`Share link generation failed: ${error.message}`);
      }

      return data.signedUrl;
    } else {
      // For local storage, return the direct path
      return path;
    }
  }

  // Enhanced CDN support
  getCdnUrl(path: string): string {
    if (this.config.provider === 'supabase') {
      // Supabase handles CDN automatically
      const { data } = supabase.storage
        .from(this.config.bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    }
    return path;
  }

  // Storage analytics
  async getStorageUsage(userId: string): Promise<{ totalSize: number; fileCount: number }> {
    if (this.config.provider === 'supabase') {
      const { data, error } = await supabase.storage
        .from(this.config.bucket)
        .list(`users/${userId}`, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw new Error(`Storage usage check failed: ${error.message}`);
      }

      const totalSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      return { totalSize, fileCount: data.length };
    }

    return { totalSize: 0, fileCount: 0 };
  }

  // Clean up old files
  async cleanupOldFiles(userId: string, olderThanDays = 30): Promise<void> {
    if (this.config.provider === 'supabase') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data, error } = await supabase.storage
        .from(this.config.bucket)
        .list(`users/${userId}`, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'asc' }
        });

      if (error) {
        throw new Error(`Cleanup listing failed: ${error.message}`);
      }

      const filesToDelete = data
        .filter(file => new Date(file.created_at) < cutoffDate)
        .map(file => `users/${userId}/${file.name}`);

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(this.config.bucket)
          .remove(filesToDelete);

        if (deleteError) {
          throw new Error(`Cleanup deletion failed: ${deleteError.message}`);
        }
      }
    }
  }
}

// Enhanced storage service with CDN and analytics
export const storage = new StorageService({
  provider: 'supabase',
  bucket: 'virtura-media'
});
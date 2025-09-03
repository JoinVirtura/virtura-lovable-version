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
}

// Default storage service instance
export const storage = new StorageService({
  provider: 'local', // Will be configurable via settings
  bucket: 'virtura-media'
});
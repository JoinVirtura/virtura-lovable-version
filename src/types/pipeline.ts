export interface VoiceConfig {
  mode: 'clone' | 'synthetic';
  voiceId?: string;
  language?: string;
  accent?: string;
  gender?: string;
  age?: string;
  model?: string;
  prompt?: string;
}

export interface TTSJob {
  script: string;
  voiceId: string;
  model: string;
}

export interface VideoConfig {
  engine: 'kling' | 'veo3';
  duration: number;
  prompt: string;
  imageUrl: string;
}

export interface SyncConfig {
  engine: 'pixverse' | 'wav2lip';
  audioUrl: string;
  videoUrl: string;
  trimEnabled?: boolean;
  trimStart?: number;
  trimEnd?: number;
}

export interface PipelineRequest {
  voice: VoiceConfig;
  video: VideoConfig;
  sync: SyncConfig;
  notes?: {
    voice?: string;
    video?: string;
    sync?: string;
  };
}

export interface PipelineJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  stage: 'voice' | 'video' | 'sync' | 'complete';
  audioUrl?: string;
  rawVideoUrl?: string;
  finalVideoUrl?: string;
  error?: string;
  logs: PipelineLog[];
  createdAt: Date;
  completedAt?: Date;
}

export interface PipelineLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  stage: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export interface PipelineSection {
  id: string;
  title: string;
  icon: string;
  progress: number;
  items: ChecklistItem[];
  notes: string;
}
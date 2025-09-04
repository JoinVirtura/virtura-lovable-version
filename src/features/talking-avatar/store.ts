// Simple store interface without zustand for now
interface Asset {
  id: string;
  kind: 'image' | 'video';
  url: string;
}

interface Voice {
  voiceId: string;
  emotion: number;
  speed: number;
  pitch: number;
  language?: string;
}

interface Style {
  preset: string;
  lookMode?: 'realistic' | 'pixar' | 'vintage' | 'cyberpunk' | 'anime';
  bg: 'blur' | 'solid' | 'upload' | 'green';
  lighting: {
    key: number;
    fill: number;
    rim: number;
  };
  camera: {
    fov: number;
    frame: 'tight' | 'medium' | 'wide';
  };
}

interface Marker {
  time: number;
  type: 'emphasis' | 'blink' | 'nod' | 'smile';
}

interface Exports {
  ratio: '9:16' | '1:1' | '16:9';
  fps: 24 | 30;
  quality: 720 | 1080;
  captions: boolean;
  transparent: boolean;
}

interface Job {
  id: string;
  status: 'idle' | 'queued' | 'processing' | 'error' | 'done';
  progress: number;
  steps: Record<string, 'pending' | 'running' | 'done' | 'error'>;
  logs: string[];
}

interface TalkingAvatarState {
  asset?: Asset;
  voice: Voice;
  style: Style;
  markers: Marker[];
  exports: Exports;
  job?: Job;
}

const initialVoice: Voice = {
  voiceId: '9BWtsMINqrJLrRacOk9x', // Aria default
  emotion: 50,
  speed: 1.0,
  pitch: 1.0,
  language: 'en'
};

const initialStyle: Style = {
  preset: 'professional',
  lookMode: 'realistic',
  bg: 'blur',
  lighting: {
    key: 80,
    fill: 40,
    rim: 20
  },
  camera: {
    fov: 35,
    frame: 'medium'
  }
};

const initialExports: Exports = {
  ratio: '16:9',
  fps: 30,
  quality: 1080,
  captions: false,
  transparent: false
};

// Export the types and initial state for now
export type { Asset, Voice, Style, Marker, Exports, Job, TalkingAvatarState };
export { initialVoice, initialStyle, initialExports };
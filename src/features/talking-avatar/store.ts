import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface TalkingAvatarStore {
  asset?: Asset;
  voice: Voice;
  style: Style;
  markers: Marker[];
  exports: Exports;
  job?: Job;
  
  // Setters
  setAsset: (asset: Asset | undefined) => void;
  setVoice: (voice: Partial<Voice>) => void;
  setStyle: (style: Partial<Style>) => void;
  setMarkers: (markers: Marker[]) => void;
  setExports: (exports: Partial<Exports>) => void;
  setJob: (job: Job | undefined) => void;
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

export const useTalkingAvatarStore = create<TalkingAvatarStore>()(
  persist(
    (set) => ({
      asset: undefined,
      voice: initialVoice,
      style: initialStyle,
      markers: [],
      exports: initialExports,
      job: undefined,

      setAsset: (asset) => set({ asset }),
      
      setVoice: (voice) => set((state) => ({
        voice: { ...state.voice, ...voice }
      })),
      
      setStyle: (style) => set((state) => ({
        style: { 
          ...state.style, 
          ...style,
          lighting: style.lighting ? { ...state.style.lighting, ...style.lighting } : state.style.lighting,
          camera: style.camera ? { ...state.style.camera, ...style.camera } : state.style.camera
        }
      })),
      
      setMarkers: (markers) => set({ markers }),
      
      setExports: (exports) => set((state) => ({
        exports: { ...state.exports, ...exports }
      })),
      
      setJob: (job) => set({ job }),
    }),
    {
      name: 'talking-avatar-store',
      partialize: (state) => ({
        voice: state.voice,
        style: state.style,
        exports: state.exports,
        markers: state.markers
      })
    }
  )
);
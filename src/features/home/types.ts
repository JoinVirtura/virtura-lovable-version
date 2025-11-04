export type Tile = {
  id: string;
  kind: 'image' | 'video';
  posterUrl: string;
  previewVideoUrl?: string;
  title: string;
  tag?: string;
  duration?: string;
  views?: number;
  byline?: string;
  prompt?: string;
};

export interface ContentCardProps {
  tile: Tile;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'wide' | 'tall' | 'standard';
  onDownload?: (tile: Tile) => void;
  onSave?: (tile: Tile) => void;
}
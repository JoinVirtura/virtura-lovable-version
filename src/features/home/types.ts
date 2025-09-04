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
};

export interface ContentCardProps {
  tile: Tile;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedTabsProps {
  value: 'all' | 'following' | 'trending';
  onValueChange: (value: 'all' | 'following' | 'trending') => void;
}

export function FeedTabs({ value, onValueChange }: FeedTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as any)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">For You</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="trending">Trending</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

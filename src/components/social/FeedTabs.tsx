import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedTabsProps {
  value: 'following' | 'trending';
  onValueChange: (value: 'following' | 'trending') => void;
}

export function FeedTabs({ value, onValueChange }: FeedTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as 'following' | 'trending')} className="w-full">
      <ScrollArea className="w-full">
        <TabsList className="inline-flex w-full min-w-max sm:grid sm:grid-cols-2">
          <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
          <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
        </TabsList>
      </ScrollArea>
    </Tabs>
  );
}

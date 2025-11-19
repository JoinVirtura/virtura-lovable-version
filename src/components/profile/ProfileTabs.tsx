import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
        <TabsTrigger 
          value="posts" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Posts
        </TabsTrigger>
        <TabsTrigger 
          value="likes" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Likes
        </TabsTrigger>
        <TabsTrigger 
          value="about" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          About
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

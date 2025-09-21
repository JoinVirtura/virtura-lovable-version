import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";
import promptLibraryData from "@/data/prompt-library.json";

interface PromptItem {
  category: string;
  title: string;
  prompt: string;
  tags?: string[];
  style?: string;
  contentType?: string;
}

interface PromptLibraryProps {
  onUsePrompt: (prompt: string, contentType?: string, style?: string) => void;
  onClose?: () => void;
}

export const PromptLibrary = ({ onUsePrompt, onClose }: PromptLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Process the prompt library data
  const prompts: PromptItem[] = useMemo(() => {
    if (!promptLibraryData || !Array.isArray(promptLibraryData)) {
      return [];
    }

    return promptLibraryData.map((item: any) => ({
      category: item.category || 'General',
      title: item.title || item.name || 'Untitled',
      prompt: item.prompt || item.description || '',
      tags: item.tags || [],
      style: item.style,
      contentType: item.contentType || 'auto'
    }));
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(prompts.map(p => p.category))];
    return cats;
  }, [prompts]);

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = searchTerm === "" || 
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchTerm, selectedCategory]);

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleUsePrompt = (item: PromptItem) => {
    onUsePrompt(item.prompt, item.contentType, item.style);
    toast.success("Prompt applied successfully!");
    onClose?.();
  };

  const getContentTypeColor = (contentType: string) => {
    const colors = {
      'portrait': 'bg-purple-100 text-purple-800',
      'landscape': 'bg-green-100 text-green-800',
      'object': 'bg-blue-100 text-blue-800',
      'abstract': 'bg-pink-100 text-pink-800',
      'scene': 'bg-yellow-100 text-yellow-800',
      'auto': 'bg-gray-100 text-gray-800'
    };
    return colors[contentType as keyof typeof colors] || colors.auto;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Prompt Library
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-auto overflow-x-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedCategory} className="mt-4">
            <ScrollArea className="h-[500px] w-full">
              <div className="grid gap-3">
                {filteredPrompts.map((item, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{item.title}</h4>
                          <Badge variant="outline" className={getContentTypeColor(item.contentType || 'auto')}>
                            {item.contentType || 'auto'}
                          </Badge>
                          {item.style && (
                            <Badge variant="secondary">{item.style}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.prompt}
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 5).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUsePrompt(item)}
                          className="flex items-center gap-1"
                        >
                          <Wand2 className="h-3 w-3" />
                          Use
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyPrompt(item.prompt)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {filteredPrompts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No prompts found matching your search.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
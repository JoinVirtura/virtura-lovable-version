import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, User, Hash, Clock, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { results, loading, search, recentSearches, clearRecentSearches } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim()) {
      const debounce = setTimeout(() => {
        search(query);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [query]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const handlePostClick = (postId: string) => {
    navigate(`/social`);
    onClose();
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, posts, hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {!query && recentSearches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Recent Searches</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
              >
                Clear all
              </Button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((recent, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentSearchClick(recent)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-accent rounded-md text-left"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{recent}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {query && (
          <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="all" className="space-y-4 mt-0">
                {results.users.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Users</h3>
                    <div className="space-y-2">
                      {results.users.slice(0, 3).map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleUserClick(user.id)}
                          className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-md"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.display_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.hashtags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.hashtags.slice(0, 5).map((tag, i) => (
                        <Button key={i} variant="secondary" size="sm">
                          <Hash className="h-3 w-3 mr-1" />
                          {tag.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {results.posts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Posts</h3>
                    <div className="space-y-2">
                      {results.posts.slice(0, 3).map((post) => (
                        <button
                          key={post.id}
                          onClick={() => handlePostClick(post.id)}
                          className="w-full text-left p-3 border rounded-lg hover:bg-accent"
                        >
                          <p className="text-sm line-clamp-2">{post.caption}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{post.profiles?.display_name}</span>
                            <span>•</span>
                            <span>{post.like_count} likes</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!loading && results.users.length === 0 && results.posts.length === 0 && results.hashtags.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No results found
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                {results.users.length > 0 ? (
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserClick(user.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-medium">{user.display_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No users found
                  </div>
                )}
              </TabsContent>

              <TabsContent value="posts" className="mt-0">
                {results.posts.length > 0 ? (
                  <div className="space-y-3">
                    {results.posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="w-full text-left p-4 border rounded-lg hover:bg-accent"
                      >
                        <p className="text-sm mb-2">{post.caption}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={post.profiles?.avatar_url} />
                            <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                          </Avatar>
                          <span>{post.profiles?.display_name}</span>
                          <span>•</span>
                          <span>{post.like_count} likes</span>
                          <span>•</span>
                          <span>{post.comment_count} comments</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No posts found
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hashtags" className="mt-0">
                {results.hashtags.length > 0 ? (
                  <div className="space-y-2">
                    {results.hashtags.map((tag, i) => (
                      <button
                        key={i}
                        className="w-full text-left p-3 border rounded-lg hover:bg-accent flex items-center gap-2"
                      >
                        <Hash className="h-5 w-5" />
                        <span className="font-medium">{tag.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No hashtags found
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}

        {loading && (
          <div className="text-center text-muted-foreground py-8">
            Searching...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

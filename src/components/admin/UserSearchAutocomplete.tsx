import { useState, useEffect } from "react";
import { Search, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
  balance?: number;
}

interface UserSearchAutocompleteProps {
  onUserSelect: (user: UserResult) => void;
  selectedUser: UserResult | null;
  onClear: () => void;
}

export function UserSearchAutocomplete({
  onUserSelect,
  selectedUser,
  onClear,
}: UserSearchAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      // Get user emails from auth.users metadata
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          display_name,
          avatar_url
        `)
        .or(
          `display_name.ilike.%${searchQuery}%,id.eq.${searchQuery}`
        )
        .limit(10);

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        setResults([]);
        return;
      }

      // Get token balances for these users
      const { data: tokens } = await supabase
        .from("user_tokens")
        .select("user_id, balance")
        .in(
          "user_id",
          profiles.map((p) => p.id)
        );

      // Get emails from auth service (only admins can do this)
      const authResponse = await supabase.auth.admin.listUsers();
      const authUsers = authResponse.data?.users || [];

      // Combine data
      const enrichedResults = profiles.map((profile) => {
        const tokenData = tokens?.find((t) => t.user_id === profile.id);
        const authUser = authUsers.find((u) => u.id === profile.id);
        
        return {
          id: profile.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          email: authUser?.email,
          balance: tokenData?.balance || 0,
        };
      });

      setResults(enrichedResults);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user: UserResult) => {
    onUserSelect(user);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onClear();
    setSearchQuery("");
    setResults([]);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUser ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={selectedUser.avatar_url || ""} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {selectedUser.display_name || selectedUser.email || "Unknown User"}
                </span>
              </div>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search users by name or ID...
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {loading
                  ? "Searching..."
                  : searchQuery.length < 2
                  ? "Type at least 2 characters to search"
                  : "No users found"}
              </CommandEmpty>
              {results.length > 0 && (
                <CommandGroup heading="Users">
                  {results.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => handleSelect(user)}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.display_name || "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email || user.id}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.balance} tokens
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedUser && (
        <Button variant="ghost" size="icon" onClick={handleClear} title="Clear selection">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

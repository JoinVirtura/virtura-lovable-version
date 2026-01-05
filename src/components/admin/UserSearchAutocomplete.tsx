import { useState, useEffect } from "react";
import { Search, X, User, Clock } from "lucide-react";
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

const RECENT_NOTIFY_USERS_KEY = "admin_recent_notify_users";

const getRecentUsers = (): UserResult[] => {
  try {
    const stored = localStorage.getItem(RECENT_NOTIFY_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentUser = (user: UserResult) => {
  try {
    const recent = getRecentUsers().filter(u => u.id !== user.id);
    const updated = [user, ...recent].slice(0, 5);
    localStorage.setItem(RECENT_NOTIFY_USERS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

export function UserSearchAutocomplete({
  onUserSelect,
  selectedUser,
  onClear,
}: UserSearchAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<UserResult[]>([]);

  // Load recent users when popover opens
  useEffect(() => {
    if (open) {
      setRecentUsers(getRecentUsers());
    }
  }, [open]);

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
      // Search profiles by display_name only (ILIKE doesn't work on UUID columns)
      const { data: profilesByName, error: nameError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${searchQuery}%`)
        .limit(20);

      if (nameError) throw nameError;

      // If search looks like a UUID prefix, also search by ID
      let profilesById: typeof profilesByName = [];
      const uuidPattern = /^[0-9a-f-]+$/i;
      if (uuidPattern.test(searchQuery) && searchQuery.length >= 4) {
        const { data } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .gte("id", searchQuery.toLowerCase())
          .lt("id", searchQuery.toLowerCase() + "g")
          .limit(10);
        
        if (data) {
          profilesById = data.filter(p => 
            p.id.toLowerCase().startsWith(searchQuery.toLowerCase())
          );
        }
      }

      // Search by email using admin edge function
      let profilesByEmail: any[] = [];
      if (searchQuery.includes("@") || searchQuery.length >= 3) {
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke(
            "admin-search-users",
            { body: { searchQuery } }
          );
          if (!emailError && emailData?.users) {
            profilesByEmail = emailData.users;
          }
        } catch (e) {
          console.log("Email search not available:", e);
        }
      }

      // Combine and deduplicate results
      const profiles = [...(profilesByName || [])];
      profilesById?.forEach(p => {
        if (!profiles.some(existing => existing.id === p.id)) {
          profiles.push(p);
        }
      });
      profilesByEmail.forEach(p => {
        if (!profiles.some(existing => existing.id === p.id)) {
          profiles.push({ ...p, email: p.email });
        } else {
          // Add email to existing profile
          const existing = profiles.find(e => e.id === p.id);
          if (existing) (existing as any).email = p.email;
        }
      });

      if (profiles.length === 0) {
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

      // Get emails from the email search results
      let authUsers: any[] = [];
      try {
        const authResponse = await supabase.auth.admin.listUsers();
        authUsers = authResponse.data?.users || [];
      } catch (authError) {
        // Admin API may not be available, continue without emails
        console.log("Admin API not available, proceeding without emails");
      }

      // Combine data and prioritize users with proper display names
      const enrichedResults = profiles.map((profile) => {
        const tokenData = tokens?.find((t) => t.user_id === profile.id);
        const authUser = authUsers.find((u: any) => u.id === profile.id);
        const hasDefaultName = !profile.display_name || profile.display_name === "User";
        
        return {
          id: profile.id,
          display_name: hasDefaultName ? null : profile.display_name,
          avatar_url: profile.avatar_url,
          balance: tokenData?.balance || 0,
        };
      });

      // Sort: users with proper names first, then by balance
      enrichedResults.sort((a, b) => {
        if (a.display_name && !b.display_name) return -1;
        if (!a.display_name && b.display_name) return 1;
        return (b.balance || 0) - (a.balance || 0);
      });

      setResults(enrichedResults.slice(0, 10));
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user: UserResult) => {
    saveRecentUser(user);
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
              {/* Recent Users Section */}
              {results.length === 0 && recentUsers.length > 0 && searchQuery.length < 2 && (
                <CommandGroup heading="Recent Users">
                  {recentUsers.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => handleSelect(user)}
                      className="flex items-center gap-3 p-2 cursor-pointer"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.display_name || user.email || `User ${user.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email || user.id.slice(0, 16)}...
                        </p>
                      </div>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {results.length > 0 && (
                <CommandGroup heading="Search Results">
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
                          {user.display_name || user.email || `User ${user.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email || user.id.slice(0, 16)}...
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

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Coins, ArrowRight, ArrowLeft, User, CheckCircle, Filter, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
  balance: number;
  lastActive?: string;
}

interface CreditTokensWithUserSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const RECENT_USERS_KEY = "admin_recent_credit_users";

const getRecentUsers = (): UserResult[] => {
  try {
    const stored = localStorage.getItem(RECENT_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentUser = (user: UserResult) => {
  try {
    const recent = getRecentUsers().filter(u => u.id !== user.id);
    const updated = [user, ...recent].slice(0, 5);
    localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

export function CreditTokensWithUserSearch({
  open,
  onOpenChange,
  onSuccess,
}: CreditTokensWithUserSearchProps) {
  const [step, setStep] = useState<"search" | "credit">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [balanceFilter, setBalanceFilter] = useState<string>("all");
  const [recentUsers, setRecentUsers] = useState<UserResult[]>([]);

  // Credit form state
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("testing");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load recent users on mount
  useEffect(() => {
    if (open) {
      setRecentUsers(getRecentUsers());
    }
  }, [open]);

  const resetState = () => {
    setStep("search");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setAmount("");
    setReason("testing");
    setNote("");
    setShowConfirmation(false);
    setBalanceFilter("all");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // Search profiles by display_name only (ILIKE doesn't work on UUID columns)
      const { data: profilesByName, error: nameError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${searchQuery}%`)
        .limit(20);

      if (nameError) throw nameError;

      // If search looks like a UUID prefix, also search by exact ID
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
      profilesByEmail.forEach((p: any) => {
        if (!profiles.some(existing => existing.id === p.id)) {
          profiles.push({ ...p, email: p.email } as any);
        } else {
          // Add email to existing profile
          const existing = profiles.find(e => e.id === p.id);
          if (existing) (existing as any).email = p.email;
        }
      });

      // Get token balances for these users
      const userIds = profiles?.map((p) => p.id) || [];
      const { data: tokens } = await supabase
        .from("user_tokens")
        .select("user_id, balance")
        .in("user_id", userIds);

      // Get last activity from token_transactions
      const { data: lastActivity } = await supabase
        .from("token_transactions")
        .select("user_id, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false });

      // Group last activity by user
      const lastActiveMap: Record<string, string> = {};
      lastActivity?.forEach((a) => {
        if (!lastActiveMap[a.user_id]) {
          lastActiveMap[a.user_id] = a.created_at;
        }
      });

      let results: UserResult[] = (profiles || []).map((p) => ({
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        balance: tokens?.find((t) => t.user_id === p.id)?.balance || 0,
        lastActive: lastActiveMap[p.id],
      }));

      // Apply balance filter
      if (balanceFilter === "low") {
        results = results.filter((u) => u.balance < 10);
      } else if (balanceFilter === "medium") {
        results = results.filter((u) => u.balance >= 10 && u.balance <= 50);
      } else if (balanceFilter === "high") {
        results = results.filter((u) => u.balance > 50);
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  // Re-search when filter changes
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [balanceFilter]);

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
    saveRecentUser(user);
    setStep("credit");
  };

  const handleSubmitCredit = () => {
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum < 1 || amountNum > 10000) {
      toast.error("Please enter a valid amount between 1 and 10,000");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmCredit = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("credit-user-tokens", {
        body: {
          targetUserId: selectedUser.id,
          amount: parseInt(amount),
          reason,
          note,
        },
      });

      if (error) throw error;

      toast.success(
        `Successfully credited ${amount} tokens to ${getUserDisplayName(selectedUser)}`
      );
      handleClose(false);
      onSuccess?.();
    } catch (error) {
      console.error("Credit error:", error);
      toast.error("Failed to credit tokens");
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: UserResult) => {
    if (user.display_name && user.display_name !== "User") {
      return user.display_name;
    }
    if (user.email) {
      return user.email;
    }
    return `User ${user.id.slice(0, 8)}`;
  };

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            {step === "search" ? "Select User" : "Credit Tokens"}
          </DialogTitle>
          <DialogDescription>
            {step === "search"
              ? "Search for a user to credit tokens"
              : `Credit tokens to ${getUserDisplayName(selectedUser!)}`}
          </DialogDescription>
        </DialogHeader>

        {step === "search" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Balance filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Balances</SelectItem>
                  <SelectItem value="low">Low (&lt;10)</SelectItem>
                  <SelectItem value="medium">Medium (10-50)</SelectItem>
                  <SelectItem value="high">High (&gt;50)</SelectItem>
                </SelectContent>
              </Select>
              {balanceFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {searchResults.length} results
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[300px]">
              {/* Recent Users Section */}
              {searchResults.length === 0 && recentUsers.length > 0 && !searchQuery && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Recent Users</span>
                  </div>
                  <div className="space-y-1">
                    {recentUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg border border-dashed hover:bg-accent transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{getUserDisplayName(user)}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email || `ID: ${user.id.slice(0, 8)}...`}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {user.balance} tokens
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && !recentUsers.length ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <User className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">Search for users above</p>
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <p className="text-sm">No users found for "{searchQuery}"</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          ID: {user.id.slice(0, 8)}...
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={user.balance < 10 ? "destructive" : "secondary"}
                            className="text-xs px-1.5 py-0"
                          >
                            {user.balance} tokens
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Active: {formatLastActive(user.lastActive)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : null}
            </ScrollArea>
          </div>
        )}

        {step === "credit" && !showConfirmation && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("search")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to search
            </Button>

            <div className="p-3 rounded-lg bg-muted flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center overflow-hidden">
                {selectedUser?.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {getUserDisplayName(selectedUser!)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  ID: {selectedUser?.id.slice(0, 16)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  Current balance: {selectedUser?.balance} tokens
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Token Amount</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="10000"
                placeholder="Enter amount (1-10,000)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testing">Testing / QA</SelectItem>
                  <SelectItem value="compensation">User Compensation</SelectItem>
                  <SelectItem value="promo">Promotional Credit</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note for the audit log..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            <Button onClick={handleSubmitCredit} className="w-full">
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {step === "credit" && showConfirmation && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-medium mb-3">Confirm Token Credit</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User:</span>
                  <span className="font-medium truncate max-w-[200px]">
                    {getUserDisplayName(selectedUser!)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-xs">
                    {selectedUser?.id.slice(0, 12)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium text-primary">+{amount} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Balance:</span>
                  <span className="font-medium">
                    {(selectedUser?.balance || 0) + parseInt(amount || "0")} tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="font-medium capitalize">{reason}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmCredit}
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  "Crediting..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" /> Confirm Credit
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

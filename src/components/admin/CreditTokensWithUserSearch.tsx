import { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Coins, ArrowRight, ArrowLeft, User, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  balance: number;
}

interface CreditTokensWithUserSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

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

  // Credit form state
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("testing");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const resetState = () => {
    setStep("search");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setAmount("");
    setReason("testing");
    setNote("");
    setShowConfirmation(false);
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
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Get token balances for these users
      const userIds = profiles?.map((p) => p.id) || [];
      const { data: tokens } = await supabase
        .from("user_tokens")
        .select("user_id, balance")
        .in("user_id", userIds);

      const results: UserResult[] = (profiles || []).map((p) => ({
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        balance: tokens?.find((t) => t.user_id === p.id)?.balance || 0,
      }));

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
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
          userId: selectedUser.id,
          amount: parseInt(amount),
          reason,
          note,
        },
      });

      if (error) throw error;

      toast.success(
        `Successfully credited ${amount} tokens to ${selectedUser.display_name || "user"}`
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            {step === "search" ? "Select User" : "Credit Tokens"}
          </DialogTitle>
          <DialogDescription>
            {step === "search"
              ? "Search for a user to credit tokens"
              : `Credit tokens to ${selectedUser?.display_name || "user"}`}
          </DialogDescription>
        </DialogHeader>

        {step === "search" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by display name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <User className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">Search for users above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
                        <p className="font-medium truncate">
                          {user.display_name || "Unnamed User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {user.balance} tokens
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
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
              <div>
                <p className="font-medium">
                  {selectedUser?.display_name || "Unnamed User"}
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
                  <span className="font-medium">
                    {selectedUser?.display_name || "Unnamed User"}
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

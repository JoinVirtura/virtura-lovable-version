import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Coins, AlertCircle } from "lucide-react";

interface CreditTokensDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
  onSuccess?: () => void;
}

export function CreditTokensDialog({ open, onOpenChange, user, onSuccess }: CreditTokensDialogProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("bonus");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Safely get current balance with proper null checking
  const currentBalance = user?.user_tokens?.[0]?.balance ?? 0;
  const newBalance = currentBalance + (parseInt(amount) || 0);

  const handleSubmit = () => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 1 || amountNum > 10000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount between 1 and 10,000 tokens",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('credit-user-tokens', {
        body: {
          targetUserId: user.id,
          amount: parseInt(amount),
          reason,
          note,
        },
      });

      if (error) throw error;

      toast({
        title: "Tokens Credited",
        description: `Successfully credited ${amount} tokens to ${user.email}`,
      });

      setAmount("");
      setNote("");
      setShowConfirmation(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Credit tokens error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to credit tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-violet-500" />
            Credit Tokens
          </DialogTitle>
        </DialogHeader>

        {!showConfirmation ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Crediting tokens to:</p>
              <p className="font-semibold">{user.display_name || user.email}</p>
              <p className="text-xs text-muted-foreground">Current Balance: {currentBalance} tokens</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (1-10,000 tokens)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="compensation">Compensation</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this credit..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Continue
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please confirm the following action:
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">{amount} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reason:</span>
                <span className="font-medium capitalize">{reason}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Balance Change:</span>
                <span className="font-bold text-lg">
                  {currentBalance} → {newBalance}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                Back
              </Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? "Processing..." : "Confirm Credit"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Flag, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Generation context — image preview + metadata captured at the call site.
  imageUrl: string;
  prompt: string;
  provider?: string;
}

const REASONS = [
  { value: "poor_quality", label: "Poor quality / artifacts" },
  { value: "wrong_aspect", label: "Wrong aspect ratio or composition" },
  { value: "ignored_prompt", label: "Didn't match my prompt" },
  { value: "inappropriate", label: "Inappropriate or unsafe content" },
  { value: "other", label: "Other" },
];

export function ReportIssueDialog({ open, onOpenChange, imageUrl, prompt, provider }: ReportIssueDialogProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setReason("");
    setDetails("");
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to report an issue.", variant: "destructive" });
      return;
    }
    if (!reason || details.trim().length < 10) {
      toast({ title: "More info needed", description: "Pick a reason and add at least 10 characters of detail.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Truncate data: URLs — they bloat the row and don't help admin review since
      // the actual content is regenerable from the prompt and ephemeral anyway.
      const safeImageUrl = imageUrl?.startsWith("data:") ? null : imageUrl || null;

      const reasonLabel = REASONS.find((r) => r.value === reason)?.label || reason;
      const subject = `Generation issue: ${reasonLabel}`;

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        name: profile?.display_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        issue_type: "credit_request",
        priority: "medium",
        subject,
        description: details,
        image_url: safeImageUrl,
        prompt: prompt || null,
        provider: provider || null,
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Report submitted",
        description: "We'll review the generation and credit you back if it doesn't look right.",
      });
      // Auto-close after a beat so the user sees the success state.
      setTimeout(() => {
        onOpenChange(false);
        reset();
      }, 1500);
    } catch (err) {
      console.error("Failed to submit report:", err);
      toast({
        title: "Couldn't submit",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-md bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-rose-400" />
            Report this generation
          </DialogTitle>
          <DialogDescription>
            Tell us what went wrong. If the result genuinely missed the mark, we'll credit your tokens back.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <p className="text-base text-green-400 font-medium">Report submitted</p>
            <p className="text-xs text-muted-foreground">Track it under Support → Recent Tickets.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {imageUrl && !imageUrl.startsWith("data:") && (
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img src={imageUrl} alt="Reported generation" className="w-full h-auto max-h-48 object-contain" />
              </div>
            )}
            {prompt && (
              <div>
                <Label className="text-xs text-muted-foreground">Prompt</Label>
                <p className="text-xs text-foreground bg-white/5 border border-white/10 rounded px-2 py-1.5 mt-1 line-clamp-3">
                  {prompt}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="report-reason">What went wrong?</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="report-reason" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Pick a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details">Details</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What did you expect, and what did you get? (10+ characters)"
                rows={4}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit report"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

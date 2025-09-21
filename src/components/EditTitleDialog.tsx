import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onSave: (newTitle: string) => Promise<void>;
}

export function EditTitleDialog({ open, onOpenChange, currentTitle, onSave }: EditTitleDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || title === currentTitle) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(title.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save title:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Title</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter new title..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
            disabled={isSaving}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
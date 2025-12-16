import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, Inbox, Check } from "lucide-react";
import { LibraryFolder } from "@/hooks/useLibraryFolders";
import { useState } from "react";

interface MoveToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: LibraryFolder[];
  currentFolderId: string | null;
  onMoveToFolder: (folderId: string | null) => Promise<boolean>;
  assetTitle: string;
}

export function MoveToFolderDialog({
  open,
  onOpenChange,
  folders,
  currentFolderId,
  onMoveToFolder,
  assetTitle
}: MoveToFolderDialogProps) {
  const [isMoving, setIsMoving] = useState(false);

  const handleMove = async (folderId: string | null) => {
    if (folderId === currentFolderId) {
      onOpenChange(false);
      return;
    }

    setIsMoving(true);
    const success = await onMoveToFolder(folderId);
    setIsMoving(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Move to Folder</DialogTitle>
          <DialogDescription className="truncate">
            Move "{assetTitle}" to a folder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 py-2 max-h-[300px] overflow-y-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-10"
            onClick={() => handleMove(null)}
            disabled={isMoving}
          >
            <Inbox className="w-4 h-4 text-muted-foreground" />
            <span>Uncategorized</span>
            {currentFolderId === null && (
              <Check className="w-4 h-4 ml-auto text-primary" />
            )}
          </Button>

          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant="ghost"
              className="w-full justify-start gap-2 h-10"
              onClick={() => handleMove(folder.id)}
              disabled={isMoving}
            >
              <Folder className="w-4 h-4" style={{ color: folder.color }} />
              <span className="truncate">{folder.name}</span>
              {currentFolderId === folder.id && (
                <Check className="w-4 h-4 ml-auto text-primary" />
              )}
            </Button>
          ))}

          {folders.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No folders yet. Create one first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

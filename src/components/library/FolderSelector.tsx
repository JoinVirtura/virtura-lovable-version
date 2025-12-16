import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Folder, FolderPlus, ChevronDown, Inbox } from "lucide-react";
import { LibraryFolder } from "@/hooks/useLibraryFolders";

interface FolderSelectorProps {
  folders: LibraryFolder[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  itemCount?: number;
}

export function FolderSelector({
  folders,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  itemCount
}: FolderSelectorProps) {
  const selectedFolderName = selectedFolder === null
    ? "All Items"
    : selectedFolder === "uncategorized"
    ? "Uncategorized"
    : folders.find(f => f.id === selectedFolder)?.name || "All Items";

  const selectedFolderColor = selectedFolder && selectedFolder !== "uncategorized"
    ? folders.find(f => f.id === selectedFolder)?.color
    : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 px-4 gap-2">
          <Folder 
            className="w-4 h-4" 
            style={selectedFolderColor ? { color: selectedFolderColor } : undefined}
          />
          <span className="max-w-[120px] truncate">{selectedFolderName}</span>
          {itemCount !== undefined && (
            <Badge variant="secondary" className="ml-1 text-xs">{itemCount}</Badge>
          )}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem
          onClick={() => onSelectFolder(null)}
          className={selectedFolder === null ? "bg-accent" : ""}
        >
          <Folder className="w-4 h-4 mr-2" />
          All Items
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectFolder("uncategorized")}
          className={selectedFolder === "uncategorized" ? "bg-accent" : ""}
        >
          <Inbox className="w-4 h-4 mr-2" />
          Uncategorized
        </DropdownMenuItem>
        
        {folders.length > 0 && <DropdownMenuSeparator />}
        
        {folders.map((folder) => (
          <DropdownMenuItem
            key={folder.id}
            onClick={() => onSelectFolder(folder.id)}
            className={selectedFolder === folder.id ? "bg-accent" : ""}
          >
            <Folder className="w-4 h-4 mr-2" style={{ color: folder.color }} />
            <span className="truncate">{folder.name}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onCreateFolder} className="text-primary">
          <FolderPlus className="w-4 h-4 mr-2" />
          New Folder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
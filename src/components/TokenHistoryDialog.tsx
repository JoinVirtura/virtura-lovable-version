import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TokenTransactionHistory } from "@/components/TokenTransactionHistory";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TokenHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenHistoryDialog({ open, onOpenChange }: TokenHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] sm:max-h-[80vh] p-0 mx-4">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Token Transaction History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          <TokenTransactionHistory isDialog={true} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

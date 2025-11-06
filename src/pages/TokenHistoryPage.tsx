import { useEffect } from "react";
import { TokenTransactionHistory } from "@/components/TokenTransactionHistory";
import { TokenBalanceDisplay } from "@/components/TokenBalanceDisplay";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TokenHistoryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Token History | Virtura";
  }, []);

  return (
    <main className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Token Transaction History</h1>
            <p className="text-muted-foreground mt-2">
              View all your token purchases and usage
            </p>
          </div>
        </div>

        <div className="mb-8">
          <TokenBalanceDisplay />
        </div>
      </div>

      <TokenTransactionHistory />
    </main>
  );
}

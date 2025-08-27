import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function PaymentCanceled() {
  const navigate = useNavigate();
  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <Card className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-display font-bold">Payment canceled</h1>
        <p className="text-muted-foreground mt-2">Your checkout was canceled. You can try again anytime.</p>
        <Button className="mt-6" onClick={() => navigate("/upgrade")}>Back to Upgrade</Button>
      </Card>
    </main>
  );
}

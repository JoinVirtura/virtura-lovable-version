import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PaymentCanceled() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/settings", { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <Card className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-display font-bold">Payment canceled</h1>
        <p className="text-muted-foreground mt-2">Your checkout was canceled. Redirecting you to your settings…</p>
        <Button className="mt-6" onClick={() => navigate("/settings", { replace: true })}>Go to Settings</Button>
      </Card>
    </main>
  );
}

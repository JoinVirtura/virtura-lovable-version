import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, TrendingDown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TokenBalanceHeaderProps {
  className?: string;
}

export function TokenBalanceHeader({ className }: TokenBalanceHeaderProps) {
  const [balance, setBalance] = useState<number>(0);
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeduction, setShowDeduction] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState(0);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_tokens')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch token balance:', error);
        setIsLoading(false);
        return;
      }

      const newBalance = data?.balance || 0;
      
      // Check if balance decreased (deduction)
      if (previousBalance > 0 && newBalance < previousBalance) {
        const deducted = previousBalance - newBalance;
        setDeductionAmount(deducted);
        setShowDeduction(true);
        setTimeout(() => setShowDeduction(false), 2000);
      }
      
      setPreviousBalance(balance);
      setBalance(newBalance);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Set up realtime subscription for balance changes
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('token-balance-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_tokens',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Token balance changed:', payload);
            if (payload.new && typeof payload.new === 'object' && 'balance' in payload.new) {
              const newBalance = (payload.new as { balance: number }).balance;
              
              // Animate deduction
              if (newBalance < balance) {
                const deducted = balance - newBalance;
                setDeductionAmount(deducted);
                setShowDeduction(true);
                setTimeout(() => setShowDeduction(false), 2000);
              }
              
              setPreviousBalance(balance);
              setBalance(newBalance);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, []);

  // Also refresh on window focus (for when user returns after generation)
  useEffect(() => {
    const handleFocus = () => fetchBalance();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/50",
        className
      )}>
        <Coins className="w-4 h-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">...</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300",
      className
    )}>
      <motion.div
        animate={showDeduction ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Coins className="w-4 h-4 text-primary" />
      </motion.div>
      
      <motion.span 
        className="text-sm font-semibold text-foreground"
        animate={showDeduction ? { color: ['hsl(var(--foreground))', 'hsl(var(--destructive))', 'hsl(var(--foreground))'] } : {}}
        transition={{ duration: 0.5 }}
      >
        {balance.toLocaleString()}
      </motion.span>
      
      <span className="text-xs text-muted-foreground">tokens</span>

      {/* Deduction Animation */}
      <AnimatePresence>
        {showDeduction && deductionAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0, x: 10 }}
            animate={{ opacity: 1, y: -20, x: 20 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute right-0 flex items-center gap-1 text-destructive font-semibold text-sm"
          >
            <TrendingDown className="w-3 h-3" />
            <span>-{deductionAmount}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low balance warning */}
      {balance < 10 && balance > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"
        />
      )}
      
      {/* Zero balance indicator */}
      {balance === 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"
        />
      )}
    </div>
  );
}

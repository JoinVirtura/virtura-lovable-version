import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

type AccountType = 'creator' | 'brand' | 'user';

const accountTypes = [
  {
    type: 'creator' as AccountType,
    icon: Sparkles,
    title: 'Creator',
    description: 'Monetize your content',
    features: [
      'Earn through tips and subscriptions',
      'Exclusive paid content',
      'Analytics and insights',
      'Creator dashboard',
    ],
    gradient: 'from-primary to-primary-blue',
  },
  {
    type: 'brand' as AccountType,
    icon: Briefcase,
    title: 'Brand',
    description: 'Discover creators',
    features: [
      'Find and collaborate with creators',
      'Campaign management',
      'Brand asset library',
      'Performance tracking',
    ],
    gradient: 'from-primary-magenta to-primary',
  },
  {
    type: 'user' as AccountType,
    icon: User,
    title: 'User',
    description: 'Explore content',
    features: [
      'Discover amazing content',
      'Follow your favorite creators',
      'Engage with community',
      'Support creators',
    ],
    gradient: 'from-primary-blue to-primary-magenta',
  },
];

export default function AccountTypeSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectType = async () => {
    if (!selectedType || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_type: selectedType })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Account type set!',
        description: `You're now set up as a ${selectedType}.`,
      });

      // Navigate based on account type
      if (selectedType === 'creator') {
        navigate('/creator-dashboard');
      } else if (selectedType === 'brand') {
        navigate('/brands');
      } else {
        navigate('/social');
      }
    } catch (error: any) {
      console.error('Error setting account type:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-blue to-primary-magenta bg-clip-text text-transparent">
            Choose Your Virtura Experience
          </h1>
          <p className="text-xl text-muted-foreground">
            Select the account type that fits you best
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {accountTypes.map((accountType, index) => {
            const Icon = accountType.icon;
            const isSelected = selectedType === accountType.type;

            return (
              <motion.div
                key={accountType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isSelected
                      ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedType(accountType.type)}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${accountType.gradient} opacity-5`} />

                  <CardHeader className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${accountType.gradient}`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        </motion.div>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{accountType.title}</CardTitle>
                    <CardDescription className="text-base">
                      {accountType.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative">
                    <ul className="space-y-3">
                      {accountType.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleSelectType}
            disabled={!selectedType || loading}
            className="bg-gradient-to-r from-primary to-primary-blue hover:opacity-90 text-lg px-8 py-6"
          >
            {loading ? 'Setting up...' : 'Get Started'}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            You can change this later in settings
          </p>
        </motion.div>
      </div>
    </div>
  );
}
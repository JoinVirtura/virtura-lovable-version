import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Handshake, DollarSign, Clock, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Contract {
  id: string;
  campaign_id: string;
  brand_id: string;
  status: string;
  payment_amount_cents: number;
  creator_payout_cents: number;
  platform_fee_cents: number;
  deadline: string | null;
  created_at: string;
  campaign?: {
    title: string;
    brand?: {
      name: string;
      logo_url: string | null;
    };
  };
}

export function BrandDealsOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get creator account
        const { data: account } = await supabase
          .from('creator_accounts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!account) {
          setLoading(false);
          return;
        }

        // Get contracts with campaign and brand info
        const { data, error } = await supabase
          .from('marketplace_contracts')
          .select(`
            *,
            campaign:marketplace_campaigns(
              title,
              brand:brands(name, logo_url)
            )
          `)
          .eq('creator_id', account.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setContracts(data || []);
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const activeContracts = contracts.filter(c => ['signed', 'in_progress'].includes(c.status));
  const pendingContracts = contracts.filter(c => ['pending_signatures', 'brand_signed', 'creator_signed'].includes(c.status));
  const completedContracts = contracts.filter(c => c.status === 'completed');

  const totalEarned = completedContracts.reduce((sum, c) => sum + c.creator_payout_cents, 0) / 100;
  const totalPending = [...activeContracts, ...pendingContracts].reduce((sum, c) => sum + c.creator_payout_cents, 0) / 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'signed':
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Active</Badge>;
      case 'pending_signatures':
      case 'brand_signed':
      case 'creator_signed':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Earned from Deals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Pending Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{contracts.length}</div>
                <div className="text-sm text-muted-foreground">Total Contracts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5" />
              Brand Deals
            </CardTitle>
            <CardDescription>
              {activeContracts.length} active • {pendingContracts.length} pending • {completedContracts.length} completed
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate('/marketplace')}>
            Browse Campaigns
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No brand deals yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse the marketplace to find campaigns and start earning!
              </p>
              <Button onClick={() => navigate('/marketplace')}>
                Explore Marketplace
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.slice(0, 10).map((contract) => (
                <div 
                  key={contract.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {contract.campaign?.brand?.logo_url ? (
                        <img 
                          src={contract.campaign.brand.logo_url} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <Handshake className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {contract.campaign?.title || 'Campaign'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contract.campaign?.brand?.name || 'Brand'} • {format(new Date(contract.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(contract.status)}
                    <div className="text-right">
                      <div className="font-bold">
                        ${(contract.creator_payout_cents / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Your payout</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { Hero } from "./Hero";
import { TrendingRow } from "@/features/home";
import { StudioBackground } from "./StudioBackground";
import { NeuralVisual } from "./NeuralVisual";
import { showcaseGallery } from "@/data/showcase-gallery";
import { BecomeCreatorCTA } from "./BecomeCreatorCTA";
import { Card } from "./ui/card";
import { Briefcase, FileCheck, DollarSign, Handshake } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OverviewPageProps {
  onViewChange: (view: string) => void;
}

export function OverviewPage({ onViewChange }: OverviewPageProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    pendingApplications: 0,
    earningsThisMonth: 0,
    activeCollaborations: 0,
  });
  const [hasBrands, setHasBrands] = useState(false);
  const [hasCreatorAccount, setHasCreatorAccount] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    // Check if user has brands
    const { data: brandsData } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    setHasBrands((brandsData?.length ?? 0) > 0);

    // Check if user has creator account
    const { data: creatorData } = await supabase
      .from('creator_accounts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setHasCreatorAccount(!!creatorData);

    // Load brand stats
    if (brandsData && brandsData.length > 0) {
      const { count: campaignsCount } = await supabase
        .from('marketplace_campaigns')
        .select('*', { count: 'exact', head: true })
        .in('brand_id', brandsData.map(b => b.id))
        .in('status', ['open', 'in_progress']);

      const { count: applicationsCount } = await supabase
        .from('marketplace_applications')
        .select('*', { count: 'exact', head: true })
        .in('campaign_id', (await supabase
          .from('marketplace_campaigns')
          .select('id')
          .in('brand_id', brandsData.map(b => b.id))).data?.map(c => c.id) || [])
        .eq('status', 'pending');

      setStats(prev => ({
        ...prev,
        activeCampaigns: campaignsCount || 0,
        pendingApplications: applicationsCount || 0,
      }));
    }

    // Load creator stats
    if (creatorData) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: earningsData } = await supabase
        .from('creator_earnings')
        .select('creator_amount_cents')
        .eq('creator_id', creatorData.id)
        .gte('created_at', startOfMonth.toISOString());

      const totalEarnings = earningsData?.reduce((sum, e) => sum + e.creator_amount_cents, 0) || 0;

      const { count: collaborationsCount } = await supabase
        .from('marketplace_applications')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', creatorData.id)
        .eq('status', 'accepted');

      setStats(prev => ({
        ...prev,
        earningsThisMonth: totalEarnings / 100, // Convert cents to dollars
        activeCollaborations: collaborationsCount || 0,
      }));
    }
  };

  return (
    <StudioBackground>
      <NeuralVisual />
      <Hero />
      
      <div className="pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-0 space-y-6">
        {/* Creator CTA */}
        <BecomeCreatorCTA />

        {/* Marketplace Stats */}
        {(hasBrands || hasCreatorAccount) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hasBrands && (
              <>
                <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onViewChange("marketplace-manage")}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                      <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onViewChange("marketplace-manage")}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <FileCheck className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                      <p className="text-sm text-muted-foreground">Pending Applications</p>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {hasCreatorAccount && (
              <>
                <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/creator/dashboard'}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${stats.earningsThisMonth.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Earnings This Month</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/marketplace/manage'}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <Handshake className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeCollaborations}</p>
                      <p className="text-sm text-muted-foreground">Active Collaborations</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        <TrendingRow tiles={showcaseGallery} className="px-0" />
      </div>
    </StudioBackground>
  );
}

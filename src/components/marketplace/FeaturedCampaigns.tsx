import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget_cents: number;
  deadline: string;
  category: string;
  brands?: {
    name: string;
    logo_url: string;
  };
}

interface FeaturedCampaignsProps {
  campaigns: Campaign[];
  onViewCampaign: (campaign: Campaign) => void;
}

export function FeaturedCampaigns({ campaigns, onViewCampaign }: FeaturedCampaignsProps) {
  if (campaigns.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Star className="w-6 h-6 text-primary fill-primary" />
        <h2 className="text-2xl font-bold">Featured Campaigns</h2>
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {campaigns.slice(0, 5).map((campaign) => (
            <CarouselItem key={campaign.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="relative overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 border border-primary/20 shadow-2xl h-full">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Featured badge */}
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 z-10">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>

                  <CardContent className="relative z-10 p-6 space-y-4">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                      {campaign.brands?.logo_url ? (
                        <img 
                          src={campaign.brands.logo_url} 
                          alt={campaign.brands.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Star className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{campaign.brands?.name || 'Brand'}</p>
                        <Badge variant="outline" className="mt-1">{campaign.category}</Badge>
                      </div>
                    </div>

                    {/* Campaign Info */}
                    <div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{campaign.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-bold">${(campaign.budget_cents / 100).toLocaleString()}</span>
                      </div>
                      {campaign.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(campaign.deadline), 'MMM dd')}
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-primary-blue"
                      onClick={() => onViewCampaign(campaign)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

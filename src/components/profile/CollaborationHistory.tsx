import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, DollarSign, CheckCircle } from 'lucide-react';

interface Collaboration {
  id: string;
  brand: string;
  brandLogo: string;
  title: string;
  completedDate: string;
  revenue: number;
  status: 'completed' | 'ongoing';
  thumbnail: string;
}

const mockCollaborations: Collaboration[] = [
  {
    id: '1',
    brand: 'Nike',
    brandLogo: 'https://logo.clearbit.com/nike.com',
    title: 'Summer Collection 2024 Campaign',
    completedDate: '2024-06-15',
    revenue: 15000,
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    brand: 'Adobe',
    brandLogo: 'https://logo.clearbit.com/adobe.com',
    title: 'Creative Cloud Tutorial Series',
    completedDate: '2024-05-20',
    revenue: 8500,
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    brand: 'Apple',
    brandLogo: 'https://logo.clearbit.com/apple.com',
    title: 'iPhone 15 Pro Showcase',
    completedDate: '2024-04-10',
    revenue: 25000,
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    brand: 'Spotify',
    brandLogo: 'https://logo.clearbit.com/spotify.com',
    title: 'Wrapped 2024 Creator Content',
    completedDate: 'Ongoing',
    revenue: 12000,
    status: 'ongoing',
    thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop'
  }
];

export function CollaborationHistory() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          Brand Collaborations
        </h3>
        <Badge variant="secondary">
          {mockCollaborations.filter(c => c.status === 'completed').length} Completed
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mockCollaborations.map((collab, index) => (
          <motion.div
            key={collab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-primary/10 hover:border-primary/30 transition-all">
              <div className="relative aspect-video">
                <img 
                  src={collab.thumbnail} 
                  alt={collab.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Brand Logo */}
                <div className="absolute top-3 left-3">
                  <img 
                    src={collab.brandLogo} 
                    alt={collab.brand}
                    className="w-10 h-10 rounded-lg bg-white p-1"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {collab.status === 'completed' ? (
                    <Badge className="bg-green-500/90 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/90 text-white animate-pulse">
                      Ongoing
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-white font-semibold text-sm">{collab.title}</h4>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {collab.completedDate}
                  </div>
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    ${collab.revenue.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Total Revenue Summary */}
      <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur-xl border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Collaboration Revenue</p>
              <p className="text-3xl font-bold text-green-400">
                ${mockCollaborations.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

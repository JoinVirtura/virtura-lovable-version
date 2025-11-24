import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Image, BarChart3, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function MediaKitSection() {
  const handleDownload = (type: string) => {
    toast.success(`Downloading ${type} media kit...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Media Kit & Press Materials</h3>
        <p className="text-sm text-muted-foreground">
          Professional resources for brands and collaborators
        </p>
      </div>

      {/* Quick Stats Overview */}
      <Card className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 backdrop-blur-xl border-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-violet-400">2.4M</p>
              <p className="text-xs text-muted-foreground">Total Reach</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-400">12.8%</p>
              <p className="text-xs text-muted-foreground">Engagement Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">156K</p>
              <p className="text-xs text-muted-foreground">Avg. Views</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">$85K</p>
              <p className="text-xs text-muted-foreground">Campaign Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Options */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-card/50 backdrop-blur-xl border-primary/10 hover:border-primary/30 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Full Media Kit PDF</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete overview with stats, rates, and portfolio
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownload('Full PDF')}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-card/50 backdrop-blur-xl border-primary/10 hover:border-primary/30 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Brand Assets Pack</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Logos, photos, and branded content
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownload('Assets')}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Assets
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-card/50 backdrop-blur-xl border-primary/10 hover:border-primary/30 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Analytics Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Detailed performance metrics and insights
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownload('Analytics')}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Contact for Collaborations</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Discuss partnership opportunities
                  </p>
                  <Button 
                    size="sm" 
                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <Mail className="w-4 h-4" />
                    Get in Touch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

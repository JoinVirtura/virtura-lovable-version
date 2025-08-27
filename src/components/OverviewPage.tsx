import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Zap, 
  Crown,
  Sparkles,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight
} from "lucide-react";

export function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground">Your dashboard at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="Search avatars..." className="w-64" />
          <Badge className="bg-gradient-gold px-3 py-1">
            <Zap className="w-4 h-4 mr-1" />
            150 credits
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Avatars</p>
              <p className="text-3xl font-bold">24</p>
              <p className="text-sm text-green-500">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Credits Used</p>
              <p className="text-3xl font-bold">156</p>
              <p className="text-sm text-green-500">+23% from last month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Premium Features</p>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-green-500">+5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Generations Today</p>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-green-500">+18% from last month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Avatars */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold">Recent Avatars</h2>
            <p className="text-sm text-muted-foreground">Your latest AI-generated avatars</p>
          </div>
          <Button className="gap-2">
            <Sparkles className="w-4 h-4" />
            Create New
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Aurora", desc: "Sophisticated redhead with emerald eyes and elegant charm", isLive: true },
            { name: "Bella", desc: "Confident beauty with natural curls and warm golden glow", isLive: true },
            { name: "Chloe", desc: "Mysterious platinum blonde with captivating blue eyes", isLive: true },
            { name: "Diana", desc: "Serene and graceful with gentle smile and natural beauty", isLive: true },
          ].map((avatar, index) => (
            <Card key={index} className="group overflow-hidden hover-zoom">
              <div className="aspect-square bg-gradient-to-br from-muted to-muted-foreground/20 relative">
                {avatar.isLive && (
                  <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                    ●
                  </Badge>
                )}
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-white border-white/50">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-white border-white/50">
                      Share
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold">{avatar.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{avatar.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold mb-4">Monthly Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credits Used</span>
              <span className="text-sm font-medium">156 / 500</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-gradient-gold h-2 rounded-full" style={{ width: "31%" }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <span className="text-sm font-medium">2.3 / 10 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "23%" }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-bold mb-4">Generation Streak</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
            <div className="flex-1">
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 bg-gradient-gold rounded"></div>
                ))}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 bg-muted rounded"></div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Keep generating to maintain your streak!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
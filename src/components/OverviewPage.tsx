import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AvatarStudio } from "@/components/AvatarStudio";
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

      {/* Avatar Studio */}
      <div className="w-full">
        <AvatarStudio />
      </div>
    </div>
  );
}
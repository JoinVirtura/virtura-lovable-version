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


      {/* Avatar Studio */}
      <div className="w-full">
        <AvatarStudio />
      </div>
    </div>
  );
}
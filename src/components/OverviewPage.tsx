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


      {/* Avatar Studio */}
      <div className="w-full">
        <AvatarStudio />
      </div>
    </div>
  );
}
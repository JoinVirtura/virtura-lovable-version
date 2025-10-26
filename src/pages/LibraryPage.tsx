import { RealAvatarLibrary } from "@/components/studio/RealAvatarLibrary";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { MotionBackground } from "@/components/MotionBackground";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calendar, HardDrive, Award } from "lucide-react";

export default function LibraryPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAssets: 0,
    thisMonth: 0,
    storageUsed: 0,
    avgQuality: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data, error } = await supabase
          .from('avatar_library')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const totalAssets = data.length;
          
          // Count items from this month
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const thisMonth = data.filter(item => 
            new Date(item.created_at) >= startOfMonth
          ).length;

          // Estimate storage (rough estimate: ~2MB per image, ~10MB per video)
          const storageUsed = data.reduce((acc, item) => {
            return acc + (item.is_video ? 10 : 2);
          }, 0);

          // Calculate average quality score
          const avgQuality = data.length > 0
            ? data.reduce((acc, item) => {
                let score = 7.0;
                const daysSinceCreation = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceCreation < 7) score += 1.5;
                else if (daysSinceCreation < 30) score += 1.0;
                if (item.is_video) score += 0.5;
                if (item.tags && item.tags.length > 2) score += 0.5;
                return acc + Math.min(9.5, score);
              }, 0) / data.length
            : 0;

          setStats({
            totalAssets,
            thisMonth,
            storageUsed,
            avgQuality: Math.round(avgQuality * 10) / 10,
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  const handleSelectAvatar = (avatarUrl: string, metadata: any) => {
    sessionStorage.setItem('selectedAvatar', JSON.stringify({ avatarUrl, metadata }));
    navigate('/video-pro');
    toast.success('Avatar selected! Opening Studio Pro...');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MotionBackground />
      <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 mt-16">
        {/* Premium Stats Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 text-white">
            AI Generation Library
          </h1>
          
          {loadingStats ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-violet-200/50 shadow-[0_8px_32px_rgba(212,110,255,0.15)] p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-16 w-32 mb-2 bg-gray-200" />
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-violet-200/50 shadow-[0_8px_32px_rgba(212,110,255,0.15)] hover:shadow-[0_12px_48px_rgba(212,110,255,0.25)] transition-all duration-300 p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Total Assets */}
                <div className="group cursor-default">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <TrendingUp className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {stats.totalAssets}
                      </div>
                      <p className="text-sm text-gray-600 font-medium mt-1">Total Assets</p>
                    </div>
                  </div>
                </div>

                {/* This Month */}
                <div className="group cursor-default">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-pink-50 group-hover:bg-pink-100 transition-colors">
                      <Calendar className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                        {stats.thisMonth}
                      </div>
                      <p className="text-sm text-gray-600 font-medium mt-1">This Month</p>
                    </div>
                  </div>
                </div>

                {/* Storage Used */}
                <div className="group cursor-default">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 transition-colors">
                      <HardDrive className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                        {stats.storageUsed}
                        <span className="text-2xl ml-1">MB</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium mt-1">Storage Used</p>
                    </div>
                  </div>
                </div>

                {/* Avg Quality */}
                <div className="group cursor-default">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                      <Award className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                        {stats.avgQuality}
                        <span className="text-2xl ml-1">/10</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium mt-1">Avg Quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Library Component */}
        <RealAvatarLibrary
          onSelectAvatar={handleSelectAvatar}
          isProcessing={false}
        />
      </main>
    </div>
  );
}

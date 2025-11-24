import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DashboardPage from "./pages/DashboardPage";
import TalkingAvatarPage from "./pages/TalkingAvatarPage";
import StudioPage from "./pages/StudioPage";
import VideoProPage from "./pages/VideoProPage";
import StudioInterface from "./components/StudioInterface";
import AIImageStudioPage from "./pages/AIImageStudioPage";
import IndividualsPage from "./pages/IndividualsPage";
import BrandsPage from "./pages/BrandsPage";
import CampaignPage from "./pages/CampaignPage";
import NotificationsPage from "./pages/NotificationsPage";
import LibraryPage from "./pages/LibraryPage";
import GuidePage from "./pages/GuidePage";
import SettingsPage from "./pages/SettingsPage";
import UploadPage from "./pages/UploadPage";
import ExportPage from "./pages/ExportPage";
import NotFound from "./pages/NotFound";
import UpgradePage from "./pages/UpgradePage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import TokenHistoryPage from "./pages/TokenHistoryPage";
import AdminCostDashboardPage from "./pages/AdminCostDashboardPage";
import AccountTypeSelection from "./pages/AccountTypeSelection";
import { DashboardLayout } from "./layouts/DashboardLayout";
import UnifiedAdminDashboard from "./pages/UnifiedAdminDashboard";
import { MarketplaceBrowser } from "./components/marketplace/MarketplaceBrowser";
import { BrandCampaignCreator } from "./components/marketplace/BrandCampaignCreator";
import { CampaignManagement } from "./components/marketplace/CampaignManagement";
import CreatorDashboard from "./pages/CreatorDashboard";
import SocialFeed from "./pages/SocialFeed";
import UserProfile from "./pages/UserProfile";
import SavedPosts from "./pages/SavedPosts";
import Analytics from "./pages/Analytics";
import ScheduledPostsPage from "./pages/ScheduledPostsPage";
import VerificationPage from "./pages/VerificationPage";
import Upgrade from "./pages/Upgrade";
import TrialAnalytics from "./pages/admin/TrialAnalytics";
import TrialExperiments from "./pages/admin/TrialExperiments";
import Support from "./pages/Support";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const Home = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <Dashboard /> : <Landing />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/landing" element={<Landing />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/individuals" element={<ProtectedRoute><IndividualsPage /></ProtectedRoute>} />
      <Route path="/brands" element={<ProtectedRoute><BrandsPage /></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute><CampaignPage /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
      <Route path="/guide" element={<ProtectedRoute><GuidePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      <Route path="/talking-avatar" element={<ProtectedRoute><TalkingAvatarPage /></ProtectedRoute>} />
      <Route path="/video-pro" element={<ProtectedRoute><VideoProPage /></ProtectedRoute>} />
      <Route path="/studio" element={<ProtectedRoute><AIImageStudioPage /></ProtectedRoute>} />
      <Route path="/studio-pro" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
      <Route path="/avatar-studio" element={<ProtectedRoute><StudioInterface /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/old-dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/gallery" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute><ExportPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Payment Routes */}
      <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
      <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="/payment-canceled" element={<ProtectedRoute><PaymentCanceled /></ProtectedRoute>} />
      <Route path="/token-history" element={<ProtectedRoute><TokenHistoryPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/costs" element={<ProtectedRoute><AdminCostDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/trial-analytics" element={<ProtectedRoute><TrialAnalytics /></ProtectedRoute>} />
      <Route path="/admin/trial-experiments" element={<ProtectedRoute><TrialExperiments /></ProtectedRoute>} />
      
      <Route path="/marketplace" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MarketplaceBrowser />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/marketplace/create" element={
        <ProtectedRoute>
          <DashboardLayout>
            <BrandCampaignCreator />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/marketplace/manage" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CampaignManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />
          <Route path="/account-type" element={<AccountTypeSelection />} />
          <Route path="/creator-dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CreatorDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
        <Route path="/social" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SocialFeed />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserProfile />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/saved" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SavedPosts />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/scheduled-posts" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ScheduledPostsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/verification" element={
          <ProtectedRoute>
            <DashboardLayout>
              <VerificationPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
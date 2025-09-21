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
import StudioInterface from "./components/StudioInterface";
import AIImageStudioPage from "./pages/AIImageStudioPage";
import IndividualsPage from "./pages/IndividualsPage";
import BrandsPage from "./pages/BrandsPage";
import LibraryPage from "./pages/LibraryPage";
import GuidePage from "./pages/GuidePage";
import SettingsPage from "./pages/SettingsPage";
import UploadPage from "./pages/UploadPage";
import ExportPage from "./pages/ExportPage";
import NotFound from "./pages/NotFound";
import UpgradePage from "./pages/UpgradePage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";

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

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/landing" element={<Landing />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/individuals" element={<ProtectedRoute><IndividualsPage /></ProtectedRoute>} />
      <Route path="/brands" element={<ProtectedRoute><BrandsPage /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
      <Route path="/guide" element={<ProtectedRoute><GuidePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      <Route path="/talking-avatar" element={<ProtectedRoute><TalkingAvatarPage /></ProtectedRoute>} />
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
      <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
      <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="/payment-canceled" element={<ProtectedRoute><PaymentCanceled /></ProtectedRoute>} />
      
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
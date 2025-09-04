
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DashboardPage from "./pages/DashboardPage";
import TalkingAvatarPage from "./pages/TalkingAvatarPage";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/individuals" element={<IndividualsPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/talking-avatar" element={<TalkingAvatarPage />} />
          <Route path="/create" element={<Dashboard />} />
          <Route path="/old-dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<Dashboard />} />
          <Route path="/gallery" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/profile" element={<Dashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

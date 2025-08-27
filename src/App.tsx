
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DashboardPage from "./pages/DashboardPage";
import IndividualsPage from "./pages/IndividualsPage";
import BrandsPage from "./pages/BrandsPage";
import LibraryPage from "./pages/LibraryPage";
import GuidePage from "./pages/GuidePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/individuals" element={<IndividualsPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/create" element={<Dashboard />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<Dashboard />} />
          <Route path="/gallery" element={<Dashboard />} />
          <Route path="/profile" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

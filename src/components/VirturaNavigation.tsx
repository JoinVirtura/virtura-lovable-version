import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Building2, Library, BookOpen, Settings, Search, Target, Menu, X } from "lucide-react";
import { TokenBalanceCompact } from "@/components/TokenBalanceDisplay";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function VirturaNavigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: "/individuals", label: "Individuals", icon: User },
    { path: "/brands", label: "Brands", icon: Building2 },
    { path: "/campaigns", label: "Campaigns", icon: Target },
    { path: "/library", label: "My Library", icon: Library },
    { path: "/guide", label: "To-Do Guide", icon: BookOpen },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-violet-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-gradient-primary drop-shadow-[0_0_8px_rgba(212,110,255,0.8)]">
                Virtura
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? "bg-violet-500/20 text-violet-300 shadow-[0_0_20px_rgba(212,110,255,0.3)] border border-violet-400/30"
                        : "text-gray-300 hover:text-violet-400 hover:bg-violet-500/5 hover:drop-shadow-[0_0_8px_rgba(212,110,255,0.4)]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <TokenBalanceCompact />
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <TokenBalanceCompact />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-black/95 backdrop-blur-xl border-violet-500/20">
                <SheetHeader>
                  <SheetTitle className="text-gradient-primary text-xl font-display">Virtura</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                          isActive
                            ? "bg-violet-500/20 text-violet-300 shadow-[0_0_20px_rgba(212,110,255,0.3)] border border-violet-400/30"
                            : "text-gray-300 hover:text-violet-400 hover:bg-violet-500/10"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                  <Button variant="ghost" className="w-full justify-start gap-3 min-h-[44px] mt-4">
                    <Search className="w-5 h-5" />
                    Search
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

    </nav>
  );
}
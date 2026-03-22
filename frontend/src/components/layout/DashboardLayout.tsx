import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  Plane,
  Bot,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Upload,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { path: "/budget", label: "Budget", icon: PiggyBank },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/trips", label: "Trips", icon: Plane },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/advisor", label: "Financial Insights", icon: Bot },
  { path: "/upload", label: "Upload Docs", icon: Upload },
];

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none flex-shrink-0">
      {initials || "U"}
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayPhone = (user as any)?.phone || null;
  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? "";

  const DropdownContents = () => (
    <>
      <div className="px-3 py-2">
        <p className="text-sm font-semibold truncate leading-none mb-1">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
        
        {displayPhone ? (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 font-medium">
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded uppercase font-bold tracking-wider">Phone</span>
            {displayPhone}
          </p>
        ) : (
          <Link to="/profile" className="text-[11px] text-blue-500 hover:text-blue-400 mt-2 inline-block font-medium">
            + hover to Add phone number
          </Link>
        )}
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="cursor-pointer">
        <Link to="/profile" className="w-full flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Settings & Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={handleLogout}
        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </DropdownMenuItem>
    </>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">
            Smart Finance
          </p>
          <p className="text-[10px] text-slate-400">Money Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors text-left hidden lg:flex">
              <UserAvatar name={displayName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {displayEmail}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
            <DropdownContents />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-slate-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 z-50 lg:hidden flex flex-col"
            >
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-8 w-8"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between border-b bg-card px-4 gap-3 flex-shrink-0">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Page title — derived from current path */}
          <p className="font-semibold text-sm hidden sm:block">
            {NAV_ITEMS.find((n) => n.path === location.pathname)?.label ??
              "Smart Finance"}
          </p>

          <div className="flex items-center gap-3 ml-auto">
            {/* Desktop user info */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <UserAvatar name={displayName} />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold leading-tight">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight truncate max-w-[120px]">
                      {displayEmail}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownContents />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

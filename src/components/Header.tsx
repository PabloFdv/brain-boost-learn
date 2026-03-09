import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home, MessageCircle, LogOut, Trophy, LayoutDashboard, Swords, Timer, Target, Menu, X, Zap, Brain, School, FlaskConical, AlertTriangle, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { isAuthenticated, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
    { href: "/battle", icon: Swords, label: "Batalha" },
    { href: "/challenge30", icon: Zap, label: "30s" },
    { href: "/simulator", icon: Target, label: "Simulado" },
    { href: "/exam-alert", icon: AlertTriangle, label: "Provas" },
    { href: "/ranking", icon: Trophy, label: "Ranking" },
    { href: "/focus", icon: Timer, label: "Foco" },
    { href: "/chat", icon: MessageCircle, label: "Prof. IA" },
  ];

  const mobileExtraItems = [
    { href: "/stats", icon: BarChart3, label: "Estatísticas" },
    { href: "/mental-lab", icon: Brain, label: "Lab Mental" },
    { href: "/school-map", icon: School, label: "Mapa Escola" },
    { href: "/error-lab", icon: FlaskConical, label: "Lab Erros" },
    { href: "/goals", icon: Target, label: "Metas" },
  ];

  // Bottom nav for mobile (most important items)
  const bottomNavItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
    { href: "/challenge30", icon: Zap, label: "30s" },
    { href: "/chat", icon: MessageCircle, label: "Prof. IA" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg"
      >
        <div className="container mx-auto flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
            </div>
            <span className="text-sm sm:text-base font-bold font-display tracking-tight text-foreground group-hover:text-primary transition-colors hidden sm:block">
              EPISTEMOLOGIA
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-0.5">
              {!isHome && (
                <Link to="/" className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Home className="h-3.5 w-3.5" />Início
                </Link>
              )}
              {navItems.map(item => (
                <Link key={item.href} to={item.href}
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-md transition-colors ${isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <item.icon className="h-3.5 w-3.5" />{item.label}
                </Link>
              ))}
              {role === "admin" && (
                <Link to="/admin" className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors">
                  Admin
                </Link>
              )}
            </nav>
          )}

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isAuthenticated && (
              <Button variant="ghost" size="icon" onClick={logout} title="Sair" className="h-8 w-8 hidden lg:flex">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Mobile Slide Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-64 bg-card border-l border-border lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-bold font-display text-sm">Menu</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="p-2 space-y-0.5">
                {!isHome && (
                  <Link to="/" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Home className="h-4 w-4" /> Início
                  </Link>
                )}
                {navItems.map(item => (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                {mobileExtraItems.map(item => (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                ))}
                {role === "admin" && (
                  <>
                    <div className="border-t border-border my-2" />
                    <Link to="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary">
                      Admin
                    </Link>
                  </>
                )}
                <div className="border-t border-border my-2" />
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors">
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border lg:hidden safe-area-pb">
          <div className="flex items-center justify-around h-14">
            {bottomNavItems.map(item => (
              <Link key={item.href} to={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`}
              >
                <item.icon className={`h-5 w-5 ${isActive(item.href) ? "text-primary" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">Mais</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};

export default Header;

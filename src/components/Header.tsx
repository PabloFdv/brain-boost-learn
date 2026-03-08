import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home, MessageCircle, LogOut, Trophy, LayoutDashboard, Swords, Timer, Target, Menu, X, Zap, Brain, School, FlaskConical, AlertTriangle } from "lucide-react";
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
    { href: "/mental-lab", icon: Brain, label: "Lab Mental" },
    { href: "/school-map", icon: School, label: "Mapa Escola" },
    { href: "/error-lab", icon: FlaskConical, label: "Lab de Erros" },
    { href: "/goals", icon: Target, label: "Metas Semanais" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg"
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-14 z-40 bg-card/95 backdrop-blur-lg border-b border-border lg:hidden max-h-[80vh] overflow-y-auto"
          >
            <nav className="container mx-auto px-4 py-3 grid grid-cols-2 gap-1">
              {!isHome && (
                <Link to="/" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted col-span-2">
                  <Home className="h-4 w-4" /> Início
                </Link>
              )}
              {navItems.map(item => (
                <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
              {mobileExtraItems.map(item => (
                <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
              {role === "admin" && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary col-span-2">
                  Admin
                </Link>
              )}
              <button onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 col-span-2">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
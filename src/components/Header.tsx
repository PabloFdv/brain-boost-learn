import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home, MessageCircle, LogOut, Trophy, LayoutDashboard, Swords, Timer } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display tracking-tight text-foreground group-hover:text-primary transition-colors">
            EPISTEMOLOGIA
          </span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          {!isHome && (
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Início</span>
            </Link>
          )}
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/ranking" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
                <Trophy className="h-4 w-4" />
                <span className="hidden md:inline">Ranking</span>
              </Link>
              <Link to="/battle" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 hidden md:flex">
                <Swords className="h-4 w-4" />
                <span className="hidden lg:inline">Batalha</span>
              </Link>
              <Link to="/chat" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Prof. IA</span>
              </Link>
            </>
          )}
          {role === "admin" && (
            <Link to="/admin" className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors">
              Admin
            </Link>
          )}
          <ThemeToggle />
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={logout} title="Sair" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;

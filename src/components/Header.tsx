import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home } from "lucide-react";
import { motion } from "framer-motion";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

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

        <nav className="flex items-center gap-4">
          {!isHome && (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              Início
            </Link>
          )}
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            Baseado na BNCC
          </span>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;

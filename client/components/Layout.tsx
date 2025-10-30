import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Palette, Sun, LogIn, UserPlus, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {showHeader && <Header />}
      <main>{children}</main>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {/* SOBR Logo - Custom SVG from Figma */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-primary"
            />
            <path
              d="M24 12L32 28H16L24 12Z"
              fill="currentColor"
              className="text-primary"
            />
            <path
              d="M14 32C14 32 16 30 20 30C22 30 23 31 24 31C25 31 26 30 28 30C32 30 34 32 34 32"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary"
            />
          </svg>
          <span className="text-2xl font-bold text-primary">SOBR</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Choose color scheme"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Palette className="w-5 h-5 text-foreground" />
          </button>

          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Sun className="w-5 h-5 text-foreground" />
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/messages"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
              >
                Messages
              </Link>
              <div className="text-sm text-muted-foreground">
                {user?.displayName}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-card p-4 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/messages"
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Messages
              </Link>
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {user?.displayName} ({user?.role})
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

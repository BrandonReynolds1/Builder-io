import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { Palette, Sun, LogIn, UserPlus } from "lucide-react";

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
  const [isDark, setIsDark] = useState(true);

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

        <div className="flex items-center gap-2 sm:gap-4">
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

          <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>

          <Link
            to="/seeker-onboarding"
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Register</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

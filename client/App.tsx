import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { checkDbHealth } from "./lib/health";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SponsorRegistration from "./pages/SponsorRegistration";
import UserNeeds from "./pages/UserNeeds";
import Messages from "./pages/Messages";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize dark theme
if (
  !document.documentElement.classList.contains("dark") &&
  !document.documentElement.classList.contains("light")
) {
  document.documentElement.classList.add("dark");
}

const App = () => {
  useEffect(() => {
    // Ensure dark theme is set
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }, []);

  useEffect(() => {
    // Check DB health early so UI can decide fallback vs DB-backed flows
    (async () => {
      try {
        await checkDbHealth();
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // DB-only: no local admin seeding

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/sponsor-registration"
                element={<SponsorRegistration />}
              />
              <Route path="/user-needs" element={<UserNeeds />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              {false && <Route path="/logo-preview" element={<div />} />} 
              <Route path="/messages" element={<Messages />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);

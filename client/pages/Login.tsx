import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
      navigate("/messages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showHeader={true}>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8 sm:p-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Log in to your SOBR account to continue
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-100">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <label className="block">
                <span className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-foreground mb-2">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="border-t border-border pt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-primary hover:text-primary/90 font-medium"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

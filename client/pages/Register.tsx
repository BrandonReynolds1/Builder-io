import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Users, ChevronRight, AlertCircle } from "lucide-react";

type Step = "role" | "details";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<"user" | "sponsor" | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!formData.displayName.trim()) {
      setError("Please enter a display name");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      await register(formData.email, formData.password, formData.displayName, selectedRole === "sponsor" ? "sponsor" : "user");
      
      // Redirect based on role
      if (selectedRole === "sponsor") {
        navigate("/sponsor-registration");
      } else {
        navigate("/user-needs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showHeader={true}>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {step === "role" ? (
            // Step 1: Role Selection
            <div className="bg-card rounded-2xl border border-border p-8 sm:p-12 animate-fade-in">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Join SOBR Today
                </h1>
                <p className="text-lg text-muted-foreground">
                  Are you seeking support or ready to help others?
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {/* User Role Card */}
                <button
                  onClick={() => {
                    setSelectedRole("user");
                    setStep("details");
                  }}
                  className={`p-8 rounded-xl border-2 transition-all text-left ${
                    selectedRole === "user"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:border-primary/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    I Need Support
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    I'm seeking help on my recovery journey and want to connect
                    with an experienced sponsor
                  </p>
                </button>

                {/* Sponsor Role Card */}
                <button
                  onClick={() => {
                    setSelectedRole("sponsor");
                    setStep("details");
                  }}
                  className={`p-8 rounded-xl border-2 transition-all text-left ${
                    selectedRole === "sponsor"
                      ? "border-secondary bg-secondary/5"
                      : "border-border bg-muted/30 hover:border-secondary/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    I Want to Sponsor
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    I'm ready to use my experience to support someone in recovery
                    and want to become a SOBR sponsor
                  </p>
                </button>
              </div>

              <button
                onClick={() => setStep("details")}
                disabled={!selectedRole}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Step 2: Account Details
            <div className="bg-card rounded-2xl border border-border p-8 sm:p-12 animate-fade-in">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Create Your Account
              </h1>
              <p className="text-muted-foreground mb-8">
                {selectedRole === "sponsor"
                  ? "Let's get your sponsor profile started"
                  : "Tell us a bit about yourself"}
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
                    Email Address *
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
                    Display Name *
                  </span>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-foreground mb-2">
                    Password *
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password *
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="border-t border-border pt-6 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <a href="/login" className="text-primary hover:text-primary/90 font-medium">
                    Log in here
                  </a>
                </p>
              </div>

              <button
                onClick={() => setStep("role")}
                className="w-full mt-4 px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

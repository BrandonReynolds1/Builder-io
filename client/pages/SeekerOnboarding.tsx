import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { CheckCircle, ChevronRight, Heart } from "lucide-react";

type Step = "intro" | "basics" | "goals" | "contact" | "complete";

interface FormData {
  firstName: string;
  email: string;
  goals: string[];
  phone: string;
}

export default function SeekerOnboarding() {
  const [step, setStep] = useState<Step>("intro");
  // Set dark theme on load
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }, []);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    email: "",
    goals: [],
    phone: "",
  });

  const goalOptions = [
    "Maintain sobriety",
    "Build healthy habits",
    "Rebuild relationships",
    "Find employment",
    "Improve mental health",
  ];

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canProceed = () => {
    if (step === "basics") return formData.firstName.trim() !== "";
    if (step === "goals") return formData.goals.length > 0;
    if (step === "contact")
      return (
        formData.email.trim() !== "" &&
        formData.phone.trim() !== "" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      );
    return true;
  };

  const getProgressPercent = () => {
    const steps: Step[] = ["intro", "basics", "goals", "contact", "complete"];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  const renderStep = () => {
    switch (step) {
      case "intro":
        return (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Welcome to SOBR
            </h1>
            <p className="text-lg text-muted-foreground mb-4 max-w-md mx-auto">
              Let's get you connected with a supportive sponsor in just a few
              minutes.
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              This quick setup will help us find the perfect match for your
              recovery journey.
            </p>
            <button
              onClick={() => setStep("basics")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );

      case "basics":
        return (
          <div className="max-w-md mx-auto animate-fade-in">
            <label className="block mb-4">
              <span className="block text-sm font-medium text-foreground mb-2">
                What's your first name?
              </span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("intro")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("goals")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case "goals":
        return (
          <div className="max-w-md mx-auto animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              What are your recovery goals?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select all that apply
            </p>
            <div className="space-y-3 mb-6">
              {goalOptions.map((goal) => (
                <label
                  key={goal}
                  className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <span className="text-foreground">{goal}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("basics")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("contact")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="max-w-md mx-auto animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              Let's get your contact info
            </h2>

            <label className="block mb-4">
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
              />
            </label>

            <label className="block mb-6">
              <span className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("goals")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("complete")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete
              </button>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center animate-fade-in max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              You're All Set!
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Welcome to SOBR, {formData.firstName}
            </p>
            <p className="text-muted-foreground mb-8">
              We're reviewing your profile and will match you with a qualified
              sponsor soon. Check your email for updates.
            </p>
            <div className="bg-muted/30 border border-muted rounded-lg p-4 mb-8 text-left">
              <h3 className="font-medium text-foreground mb-3">Your Profile</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Name:</span> {formData.firstName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {formData.email}
                </p>
                <p>
                  <span className="font-medium">Goals:</span>{" "}
                  {formData.goals.join(", ")}
                </p>
              </div>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </a>
          </div>
        );
    }
  };

  return (
    <Layout showHeader={true}>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          {step !== "intro" && step !== "complete" && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {["intro", "basics", "goals", "contact"].indexOf(step) + 1} of 3
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${getProgressPercent()}%` }}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-card rounded-2xl border border-border p-8 sm:p-12">
            {renderStep()}
          </div>
        </div>
      </div>
    </Layout>
  );
}

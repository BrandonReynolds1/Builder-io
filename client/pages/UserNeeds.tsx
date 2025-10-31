import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, ChevronRight, Heart } from "lucide-react";
import CrisisResources from "@/components/CrisisResources";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { recordTelemetryEvent } from "@/lib/telemetry";

type Step = "goals" | "urgency" | "complete";

export default function UserNeeds() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [step, setStep] = useState<Step>("goals");
  const [goals, setGoals] = useState<string[]>([]);
  const [urgency, setUrgency] = useState("");
  const [acknowledgedCrisis, setAcknowledgedCrisis] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [telemetryOptIn, setTelemetryOptIn] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const goalOptions = [
    "Maintain sobriety",
    "Build healthy habits",
    "Rebuild relationships",
    "Find employment",
    "Improve mental health",
    "Develop coping strategies",
    "Spiritual growth",
    "Legal/financial issues",
  ];

  const [urgencyOptions, setUrgencyOptions] = useState<{ value: string; label: string; icon?: string }[]>([]);

  // Fallback options to use if config fetch fails or Supabase not configured
  const defaultUrgencyOptions = [
    { value: "crisis", label: "In Crisis - Need Help Now", icon: "🆘" },
    { value: "urgent", label: "Urgent - This Week", icon: "⚡" },
    { value: "soon", label: "Soon - Within a Month", icon: "⏰" },
    { value: "general", label: "General Support", icon: "💙" },
  ];

  useEffect(() => {
    let mounted = true;
    import("@/lib/config")
      .then((mod) => mod.fetchAppConfig())
      .then((cfg) => {
        if (!mounted) return;
        if (cfg.priorities && cfg.priorities.length > 0) {
          // Map priorities rows to urgency options; attempt to assign icons for known keys
          const iconMap: Record<string, string> = {
            crisis: "🆘",
            urgent: "⚡",
            soon: "⏰",
            general: "💙",
            routine: "✅",
          };
          const opts = cfg.priorities.map((p: any) => ({
            value: p.key ?? String(p.id),
            label: p.label ?? p.key ?? String(p.id),
            icon: iconMap[p.key] ?? undefined,
          }));
          setUrgencyOptions(opts);
        } else {
          setUrgencyOptions(defaultUrgencyOptions);
        }
      })
      .catch(() => setUrgencyOptions(defaultUrgencyOptions));
    return () => {
      mounted = false;
    };
  }, []);

  const handleGoalToggle = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleNext = () => {
    if (step === "goals") {
      if (goals.length === 0) return;
      setStep("urgency");
    } else if (step === "urgency") {
      if (!urgency) return;
      // If the user selected 'crisis' we require an acknowledgement to
      // ensure resources are seen before continuing registration.
      if (urgency === "crisis" && !acknowledgedCrisis) return;
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    updateUserProfile({
      recoveryGoals: goals,
    });
    setStep("complete");
  };

  const getProgressPercent = () => {
    const steps: Step[] = ["goals", "urgency", "complete"];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  const renderStep = () => {
    switch (step) {
      case "goals":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              What are your recovery goals?
            </h2>
            <p className="text-muted-foreground mb-6">
              Select all that apply. This helps us match you with the right
              sponsor.
            </p>

            <div className="space-y-3 mb-8">
              {goalOptions.map((goal) => (
                <label
                  key={goal}
                  className="flex items-center gap-3 p-4 border border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={goals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <span className="text-foreground text-lg">{goal}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/register")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={goals.length === 0}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        );

      case "urgency":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              How urgent is your need for support?
            </h2>
            <p className="text-muted-foreground mb-6">
              This helps us prioritize your matching with an available sponsor.
            </p>

            <div className="space-y-3 mb-8">
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setUrgency(option.value);
                    // reset acknowledgement when changing away from crisis
                    if (option.value !== "crisis") setAcknowledgedCrisis(false);
                    // open modal for crisis so resources are prominent
                    if (option.value === "crisis") setShowCrisisModal(true);
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    urgency === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <p className="font-medium text-foreground">{option.label}</p>
                </button>
              ))}
            </div>

            {/* If user selected 'crisis' show crisis resources in a modal */}
            <Dialog open={showCrisisModal} onOpenChange={setShowCrisisModal}>
              <DialogContent className="bg-red-50/90 border-red-200">
                <DialogHeader>
                  <DialogTitle className="text-red-950 text-xl">Resources & Immediate Help</DialogTitle>
                  <DialogDescription className="text-red-950/90 font-medium">
                    
                  </DialogDescription>
                </DialogHeader>

                <div>
                  <CrisisResources />

                  <label className="flex items-start gap-3 mt-4">
                    <input
                      type="checkbox"
                      checked={telemetryOptIn}
                      onChange={(e) => setTelemetryOptIn(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-sm text-red-950/90">
                      Share an anonymous event with the app to help our team
                      understand urgent need volume so we can improve support.
                      No personal data is sent without your explicit consent.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 mt-4">
                    <input
                      type="checkbox"
                      checked={acknowledgedCrisis}
                      onChange={(e) => setAcknowledgedCrisis(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-sm text-red-950/90 font-medium">
                      I have read these resources and would like to continue
                      with registration.
                    </span>
                  </label>
                </div>

                <DialogFooter>
                  <div className="flex gap-2">
                    <a
                      href="tel:988"
                      className="inline-flex items-center px-3 py-2 rounded-md bg-red-100 border-2 border-red-300 text-red-950 font-medium hover:bg-red-200 transition-colors"
                    >
                      Call 988
                    </a>
                    <button
                      onClick={() => {
                            // record telemetry if user opted-in
                            if (telemetryOptIn && user) {
                              recordTelemetryEvent({
                                event: "crisis_selected",
                                userId: user.id,
                                payload: { goals, urgency: "crisis" },
                              });
                            }
                        // close modal and allow continuing
                        setShowCrisisModal(false);
                      }}
                      disabled={!acknowledgedCrisis}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Continue Registration
                    </button>
                  </div>
                </DialogFooter>
                <DialogClose />
              </DialogContent>
            </Dialog>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("goals")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!urgency || (urgency === "crisis" && !acknowledgedCrisis)}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Setup
              </button>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              Welcome to SOBR, {user.displayName}!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your profile is set up and ready. We're matching you with suitable
              sponsors now.
            </p>

            <div className="bg-muted/30 border border-muted rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-foreground mb-4">Your Profile</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    Recovery Goals:
                  </span>
                </p>
                <ul className="ml-4 space-y-1">
                  {goals.map((goal) => (
                    <li key={goal}>• {goal}</li>
                  ))}
                </ul>
                <p className="mt-3">
                  <span className="font-medium text-foreground">
                    Support Needed:
                  </span>{" "}
                  {urgencyOptions.find((o) => o.value === urgency)?.label}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/messages")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Messages & Browse Sponsors
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );
    }
  };

  return (
    <Layout showHeader={true}>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {step !== "complete" && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {["goals", "urgency"].indexOf(step) + 1} of 2
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

          <div className="bg-card rounded-2xl border border-border p-8 sm:p-12">
            {renderStep()}
          </div>
        </div>
      </div>
    </Layout>
  );
}

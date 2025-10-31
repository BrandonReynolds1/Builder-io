import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, ChevronRight, FileCheck } from "lucide-react";

type Step = "qualifications" | "experience" | "references" | "complete";

interface Reference {
  name: string;
  relationship: string;
  email: string;
  phone: string;
}

export default function SponsorRegistration() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [step, setStep] = useState<Step>("qualifications");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [certifications, setCertifications] = useState("");
  const [references, setReferences] = useState<Reference[]>([
    { name: "", relationship: "", email: "", phone: "" },
    { name: "", relationship: "", email: "", phone: "" },
  ]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const qualificationOptions = [
    "Personal recovery experience",
    "Peer support certification",
    "Counseling/social work degree",
    "Addiction specialist training",
    "First aid/CPR certification",
  ];

  const handleQualificationToggle = (qual: string) => {
    setQualifications((prev) =>
      prev.includes(qual) ? prev.filter((q) => q !== qual) : [...prev, qual],
    );
  };

  const handleReferenceChange = (
    index: number,
    field: keyof Reference,
    value: string,
  ) => {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)),
    );
  };

  const canProceed = () => {
    if (step === "qualifications") {
      return qualifications.length > 0 && yearsOfExperience > 0;
    }
    if (step === "experience") {
      return certifications.trim() !== "";
    }
    if (step === "references") {
      return references.every((r) => r.name && r.relationship && r.email);
    }
    return true;
  };

  const getProgressPercent = () => {
    const steps: Step[] = [
      "qualifications",
      "experience",
      "references",
      "complete",
    ];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  const handleComplete = () => {
    updateUserProfile({
      qualifications,
      yearsOfExperience,
    });
    setStep("complete");
  };

  const renderStep = () => {
    switch (step) {
      case "qualifications":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Your Qualifications
            </h2>
            <p className="text-muted-foreground mb-6">
              Select all that apply to your experience:
            </p>

            <div className="space-y-3 mb-6">
              {qualificationOptions.map((qual) => (
                <label
                  key={qual}
                  className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={qualifications.includes(qual)}
                    onChange={() => handleQualificationToggle(qual)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <span className="text-foreground">{qual}</span>
                </label>
              ))}
            </div>

            <label className="block mb-6">
              <span className="block text-sm font-medium text-foreground mb-2">
                Years of Experience in Recovery Support *
              </span>
              <input
                type="number"
                min="0"
                value={yearsOfExperience}
                onChange={(e) =>
                  setYearsOfExperience(parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/user-needs")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("experience")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        );

      case "experience":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Certifications & Background
            </h2>

            <label className="block mb-6">
              <span className="block text-sm font-medium text-foreground mb-2">
                Tell us about relevant certifications or training *
              </span>
              <textarea
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="E.g., Certified Peer Recovery Coach (CPRC), 12-step sponsor, etc."
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("qualifications")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("references")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        );

      case "references":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Professional References
            </h2>
            <p className="text-muted-foreground mb-6">
              Provide two references who can verify your experience and
              character
            </p>

            {references.map((ref, index) => (
              <div
                key={index}
                className="mb-6 p-6 border border-border rounded-lg"
              >
                <h3 className="font-bold text-foreground mb-4">
                  Reference {index + 1}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={ref.name}
                    onChange={(e) =>
                      handleReferenceChange(index, "name", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g., Counselor, Mentor)"
                    value={ref.relationship}
                    onChange={(e) =>
                      handleReferenceChange(
                        index,
                        "relationship",
                        e.target.value,
                      )
                    }
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={ref.email}
                    onChange={(e) =>
                      handleReferenceChange(index, "email", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={ref.phone}
                    onChange={(e) =>
                      handleReferenceChange(index, "phone", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("experience")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Registration
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
              Application Submitted!
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Thank you, {user.displayName}!
            </p>
            <p className="text-muted-foreground mb-8">
              We've received your sponsor application. Our team will review your
              qualifications and verify your references.
            </p>

            <div className="bg-muted/30 border border-muted rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-foreground mb-4">What's Next</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">
                    1.
                  </span>
                  <span>Reference verification (3-5 business days)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">
                    2.
                  </span>
                  <span>Background check review</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">
                    3.
                  </span>
                  <span>Sponsor training program (online, 2 weeks)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">
                    4.
                  </span>
                  <span>Profile activation and seeker matching</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => navigate("/messages")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Messages
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
                  Step{" "}
                  {["qualifications", "experience", "references"].indexOf(
                    step,
                  ) + 1}{" "}
                  of 3
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

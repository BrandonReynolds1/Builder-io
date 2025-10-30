import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Users,
  FileCheck,
} from "lucide-react";

type Step =
  | "intro"
  | "personal"
  | "background"
  | "experience"
  | "commitment"
  | "review"
  | "submitted";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  backgroundConsent: boolean;
  felonyHistory: string;
  recoveryExperience: string;
  sponsorshipExperience: string;
  weeklyCommitment: string;
  motivations: string[];
  references: Array<{ name: string; relationship: string; email: string }>;
}

export default function VolunteerOnboarding() {
  const [step, setStep] = useState<Step>("intro");

  // Set dark theme on load
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }, []);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    backgroundConsent: false,
    felonyHistory: "",
    recoveryExperience: "",
    sponsorshipExperience: "",
    weeklyCommitment: "",
    motivations: [],
    references: [
      { name: "", relationship: "", email: "" },
      { name: "", relationship: "", email: "" },
    ],
  });

  const motivationOptions = [
    "Personal recovery experience",
    "Desire to give back",
    "Professional background in counseling/social work",
    "Community involvement",
    "Faith-based calling",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement & {
      type: string;
    };
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMotivationToggle = (motivation: string) => {
    setFormData((prev) => ({
      ...prev,
      motivations: prev.motivations.includes(motivation)
        ? prev.motivations.filter((m) => m !== motivation)
        : [...prev.motivations, motivation],
    }));
  };

  const handleReferenceChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.map((ref, i) =>
        i === index ? { ...ref, [field]: value } : ref,
      ),
    }));
  };

  const canProceed = () => {
    switch (step) {
      case "intro":
        return true;
      case "personal":
        return (
          formData.firstName.trim() !== "" &&
          formData.lastName.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.phone.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        );
      case "background":
        return (
          formData.dateOfBirth !== "" &&
          formData.address.trim() !== "" &&
          formData.backgroundConsent &&
          formData.felonyHistory !== ""
        );
      case "experience":
        return (
          formData.recoveryExperience !== "" &&
          formData.sponsorshipExperience !== ""
        );
      case "commitment":
        return (
          formData.weeklyCommitment !== "" &&
          formData.motivations.length > 0 &&
          formData.references.every((r) => r.name && r.relationship && r.email)
        );
      case "review":
        return true;
      default:
        return false;
    }
  };

  const getProgressPercent = () => {
    const steps: Step[] = [
      "intro",
      "personal",
      "background",
      "experience",
      "commitment",
      "review",
      "submitted",
    ];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  const renderStep = () => {
    switch (step) {
      case "intro":
        return (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Become a SOBR Sponsor
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
              Making a difference in someone's recovery journey is meaningful
              work. We take this responsibility seriously.
            </p>

            <div className="bg-muted/30 border border-muted rounded-lg p-6 mb-8 max-w-md mx-auto text-left">
              <h3 className="font-bold text-foreground mb-4">
                Our Vetting Process
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <FileCheck className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Comprehensive Application
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Detailed questionnaire about your background and
                      experience
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Background Verification
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Standard criminal background check required
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Reference Check
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Verification with professional references
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("personal")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Begin Application
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );

      case "personal":
        return (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Personal Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <label>
                <span className="block text-sm font-medium text-foreground mb-2">
                  First Name *
                </span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  autoFocus
                />
              </label>
              <label>
                <span className="block text-sm font-medium text-foreground mb-2">
                  Last Name *
                </span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </label>
              <label>
                <span className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </label>
              <label>
                <span className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("intro")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("background")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        );

      case "background":
        return (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Background Information
            </h2>

            <label className="block mb-4">
              <span className="block text-sm font-medium text-foreground mb-2">
                Date of Birth *
              </span>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </label>

            <label className="block mb-6">
              <span className="block text-sm font-medium text-foreground mb-2">
                Address *
              </span>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street, City, State, ZIP"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </label>

            <div className="bg-muted/30 border border-muted rounded-lg p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="backgroundConsent"
                  checked={formData.backgroundConsent}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded accent-secondary mt-1 flex-shrink-0"
                />
                <div>
                  <p className="font-medium text-foreground">
                    Background Check Consent *
                  </p>
                  <p className="text-sm text-muted-foreground">
                    I understand that SOBR will conduct a criminal background
                    check and consent to this verification process.
                  </p>
                </div>
              </label>
            </div>

            <label className="block mb-6">
              <span className="block text-sm font-medium text-foreground mb-2">
                Do you have any felony convictions? *
              </span>
              <select
                name="felonyHistory"
                value={formData.felonyHistory}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Select...</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="not-sure">Not sure</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Having a felony doesn't automatically disqualify you. We
                evaluate each case individually.
              </p>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("personal")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("experience")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        );

      case "experience":
        return (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Your Experience
            </h2>

            <label className="block mb-6">
              <span className="block text-sm font-medium text-foreground mb-2">
                Do you have personal recovery experience? *
              </span>
              <select
                name="recoveryExperience"
                value={formData.recoveryExperience}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Select...</option>
                <option value="yes-own">
                  Yes, personal substance use disorder
                </option>
                <option value="yes-family">
                  Yes, family member/close friend
                </option>
                <option value="professional">Professional background</option>
                <option value="none">
                  No personal/professional experience
                </option>
              </select>
            </label>

            <label className="block mb-6">
              <span className="block text-sm font-medium text-foreground mb-2">
                Previous sponsorship experience? *
              </span>
              <textarea
                name="sponsorshipExperience"
                value={formData.sponsorshipExperience}
                onChange={handleInputChange}
                placeholder="Describe any previous experience sponsoring, mentoring, or supporting someone in recovery..."
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("background")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("commitment")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        );

      case "commitment":
        return (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Commitment & Motivations
            </h2>

            <label className="block mb-6">
              <span className="block text-sm font-medium text-foreground mb-2">
                How many hours per week can you commit? *
              </span>
              <select
                name="weeklyCommitment"
                value={formData.weeklyCommitment}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Select...</option>
                <option value="3-5">3-5 hours per week</option>
                <option value="5-10">5-10 hours per week</option>
                <option value="10-15">10-15 hours per week</option>
                <option value="15+">15+ hours per week</option>
              </select>
            </label>

            <div className="mb-6">
              <h3 className="font-medium text-foreground mb-3">
                What are your motivations? *
              </h3>
              <div className="space-y-2">
                {motivationOptions.map((motivation) => (
                  <label
                    key={motivation}
                    className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.motivations.includes(motivation)}
                      onChange={() => handleMotivationToggle(motivation)}
                      className="w-5 h-5 rounded accent-secondary"
                    />
                    <span className="text-foreground">{motivation}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-foreground mb-3">
                Professional References *
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Provide two professional or personal references who can vouch
                for your character
              </p>
              {formData.references.map((ref, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border border-border rounded-lg"
                >
                  <p className="font-medium text-foreground mb-3">
                    Reference {index + 1}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={ref.name}
                      onChange={(e) =>
                        handleReferenceChange(index, "name", e.target.value)
                      }
                      className="px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={ref.relationship}
                      onChange={(e) =>
                        handleReferenceChange(
                          index,
                          "relationship",
                          e.target.value,
                        )
                      }
                      className="px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={ref.email}
                    onChange={(e) =>
                      handleReferenceChange(index, "email", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("experience")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("review")}
                disabled={!canProceed()}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Application
              </button>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Review Your Application
            </h2>

            <div className="bg-muted/30 border border-muted rounded-lg p-6 mb-6 space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Personal Information
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {formData.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {formData.phone}
                  </p>
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <h3 className="font-medium text-foreground mb-2">Background</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium">Age:</span>{" "}
                    {formData.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(formData.dateOfBirth).getFullYear()
                      : "—"}
                  </p>
                  <p>
                    <span className="font-medium">Felony History:</span>{" "}
                    {formData.felonyHistory === "no"
                      ? "No"
                      : formData.felonyHistory === "yes"
                        ? "Yes"
                        : "Not sure"}
                  </p>
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <h3 className="font-medium text-foreground mb-2">Commitment</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium">Weekly Hours:</span>{" "}
                    {formData.weeklyCommitment || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Motivations:</span>{" "}
                    {formData.motivations.length > 0
                      ? formData.motivations.join(", ")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground">
                By submitting this application, you confirm that all information
                is accurate and complete. Our team will review your application
                and conduct the necessary background checks. We'll contact you
                within 5-7 business days.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("commitment")}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("submitted")}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Submit Application
              </button>
            </div>
          </div>
        );

      case "submitted":
        return (
          <div className="text-center animate-fade-in max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              Application Submitted!
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Thank you, {formData.firstName}!
            </p>
            <p className="text-muted-foreground mb-8">
              We've received your sponsor application. Our team will review your
              information and conduct background verification.
            </p>

            <div className="bg-muted/30 border border-muted rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-foreground mb-4">
                What Happens Next
              </h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-secondary flex-shrink-0">
                    1.
                  </span>
                  <span className="text-muted-foreground">
                    Background check processing (3-5 days)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-secondary flex-shrink-0">
                    2.
                  </span>
                  <span className="text-muted-foreground">
                    Reference verification
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-secondary flex-shrink-0">
                    3.
                  </span>
                  <span className="text-muted-foreground">
                    Sponsor training program (online, ~2 weeks)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-secondary flex-shrink-0">
                    4.
                  </span>
                  <span className="text-muted-foreground">
                    Profile activation and seeker matching
                  </span>
                </li>
              </ol>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              We'll send updates to{" "}
              <span className="font-medium">{formData.email}</span>
            </p>

            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Back to Home
            </a>
          </div>
        );
    }
  };

  return (
    <Layout showHeader={true}>
      <div className="min-h-screen bg-gradient-to-b from-secondary/5 via-background to-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          {step !== "intro" && step !== "submitted" && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step{" "}
                  {[
                    "intro",
                    "personal",
                    "background",
                    "experience",
                    "commitment",
                    "review",
                  ].indexOf(step) + 1}{" "}
                  of 5
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-300"
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

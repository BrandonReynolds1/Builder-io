import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Clock, Shield, Users, Heart } from "lucide-react";

export default function Index() {
  return (
    <Layout showHeader={true}>
      <div className="bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              You're Not Alone in This Journey
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with experienced sponsors who understand your struggle. Free,
              confidential support available 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/seeker-onboarding"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-lg"
              >
                Get Help Now
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-3 border border-border bg-muted/20 text-foreground rounded-lg font-medium hover:bg-muted/40 transition-colors text-lg">
                Learn How It Works
              </button>
            </div>
          </div>
        </section>

        {/* Crisis Banner */}
        <section className="bg-amber-600/20 border-y border-amber-600/30 py-4">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-amber-100 font-medium">
              <strong>Crisis?</strong> Call 988 (Suicide & Crisis Lifeline) or 911
              for immediate emergency assistance
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Immediate Support */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Immediate Support
              </h3>
              <p className="text-muted-foreground">
                Connect with available sponsors in minutes, not days
              </p>
            </div>

            {/* 100% Confidential */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                100% Confidential
              </h3>
              <p className="text-muted-foreground">
                Your privacy is protected. All connections are secure and private
              </p>
            </div>

            {/* Experienced Sponsors */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Experienced Sponsors
              </h3>
              <p className="text-muted-foreground">
                Connect with people who've been through recovery themselves
              </p>
            </div>

            {/* Always Free */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Always Free
              </h3>
              <p className="text-muted-foreground">
                No cost, no insurance required. Help when you need it most
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-muted/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-foreground mb-16">
              How SOBR Works
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">
                    Share Your Needs
                  </h3>
                  <p className="text-muted-foreground">
                    Tell us if you're in crisis or exploring options. Share what
                    type of support you're looking for.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">
                    Get Matched
                  </h3>
                  <p className="text-muted-foreground">
                    We'll show you available sponsors who specialize in your
                    specific situation and recovery path.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">
                    Connect & Start Your Journey
                  </h3>
                  <p className="text-muted-foreground">
                    Reach out via call or message. Your sponsor will help guide you
                    toward the resources and support you need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Take the First Step?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Recovery is possible. Let us help you connect with someone who can
              support you on your journey.
            </p>
            <Link
              to="/seeker-onboarding"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors text-lg"
            >
              Get Help Now
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-8">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0 opacity-50"
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
                <div>
                  <div className="font-bold text-primary">SOBR</div>
                  <p className="text-sm text-muted-foreground">
                    SOBR is a free resource connecting people in recovery.
                    <br />
                    Not a substitute for professional medical treatment.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground border-t border-border pt-6">
              <p>
                National Helplines: SAMHSA 1-800-662-4357 | Crisis Lifeline 988
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}

import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Heart, Users } from "lucide-react";

export default function Index() {
  return (
    <Layout showHeader={true}>
      <div className="bg-gradient-to-b from-primary/5 via-secondary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-24 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 text-foreground">
              Find <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Support</span> You Need
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              SOBR connects individuals seeking recovery with dedicated volunteer sponsors who understand the journey and are committed to supporting your path to wellness.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 text-secondary" />
                <span>Compassionate Support</span>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-primary" />
                <span>Trusted Volunteers</span>
              </div>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            {/* Seeker Card */}
            <Link
              to="/seeker-onboarding"
              className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 sm:p-10 transition-all hover:shadow-lg hover:border-primary/50 animate-slide-up"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">
                  I'm Seeking Support
                </h2>
                <p className="text-muted-foreground mb-6">
                  Looking for a compassionate sponsor to support your recovery journey? Get started with a quick, simple process.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Quick setup - takes 5 minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Matched with verified sponsors
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Start your journey today
                  </li>
                </ul>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium group-hover:bg-primary/20 transition-colors">
                  Get Started
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Volunteer Card */}
            <Link
              to="/volunteer-onboarding"
              className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 sm:p-10 transition-all hover:shadow-lg hover:border-secondary/50 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Users className="w-7 h-7 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">
                  I Want to Volunteer
                </h2>
                <p className="text-muted-foreground mb-6">
                  Ready to make a meaningful difference? Become a sponsor and support someone on their path to recovery.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Comprehensive vetting process
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Background verification included
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Training and ongoing support
                  </li>
                </ul>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 text-secondary font-medium group-hover:bg-secondary/20 transition-colors">
                  Apply Now
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Info Section */}
          <div
            id="about"
            className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8 sm:p-12"
          >
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              How SOBR Works
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-3 text-foreground">
                  For Those Seeking Support
                </h3>
                <ol className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                    <span>Complete a brief questionnaire about your recovery goals</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                    <span>We match you with vetted, compassionate sponsors</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                    <span>Connect directly and build your support relationship</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3 text-foreground">
                  For Volunteer Sponsors
                </h3>
                <ol className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex gap-3">
                    <span className="font-bold text-secondary flex-shrink-0">1.</span>
                    <span>Complete application and background verification</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-secondary flex-shrink-0">2.</span>
                    <span>Participate in sponsor training program</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-secondary flex-shrink-0">3.</span>
                    <span>Get matched and begin supporting a seeker</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>
            SOBR is committed to creating safe, supportive connections for recovery.
          </p>
          <p className="mt-2">
            © 2024 SOBR. All rights reserved.
          </p>
        </div>
      </footer>
    </Layout>
  );
}

export default function LogoPreview() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">SOBR Logo Options - Sunrise Variations</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Option 1: Classic Sunrise */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Option 1: Classic Sunrise</h2>
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Horizon line */}
                <path d="M 6 30 L 42 30" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
                {/* Simple semi-circle sun */}
                <path d="M 12 30 Q 12 18 24 18 Q 36 18 36 30" stroke="currentColor" strokeWidth="3" fill="none" className="text-primary" />
                {/* Three simple rays */}
                <path d="M 24 10 L 24 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
                <path d="M 14 14 L 18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
                <path d="M 34 14 L 30 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
              </svg>
              <span className="text-2xl font-bold text-primary">SOBR</span>
            </div>
            <p className="text-sm text-muted-foreground">Simple and clean</p>
          </div>

          {/* Option 2: Filled Sunrise */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Option 2: Filled Sun</h2>
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Horizon */}
                <path d="M 6 30 L 42 30" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
                {/* Filled semi-circle sun */}
                <path d="M 12 30 Q 12 18 24 18 Q 36 18 36 30 Z" fill="currentColor" className="text-primary" />
                {/* Rays */}
                <path d="M 24 10 L 24 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
                <path d="M 14 14 L 17 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
                <path d="M 34 14 L 31 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
              </svg>
              <span className="text-2xl font-bold text-primary">SOBR</span>
            </div>
            <p className="text-sm text-muted-foreground">Bold and warm</p>
          </div>

          {/* Option 3: Sunrise with Multiple Rays */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Option 3: Radiant Sunrise</h2>
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Horizon */}
                <path d="M 6 30 L 42 30" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
                {/* Sun */}
                <circle cx="24" cy="30" r="8" fill="currentColor" className="text-primary" />
                {/* Five rays */}
                <path d="M 24 8 L 24 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
                <path d="M 12 12 L 17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
                <path d="M 36 12 L 31 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
                <path d="M 6 24 L 14 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
                <path d="M 42 24 L 34 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
              </svg>
              <span className="text-2xl font-bold text-primary">SOBR</span>
            </div>
            <p className="text-sm text-muted-foreground">Full of energy</p>
          </div>

          {/* Option 4: Minimalist Sunrise */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Option 4: Minimal Dawn</h2>
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Just horizon and sun, no rays */}
                <path d="M 8 28 L 40 28" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
                <circle cx="24" cy="28" r="10" fill="currentColor" className="text-primary" />
              </svg>
              <span className="text-2xl font-bold text-primary">SOBR</span>
            </div>
            <p className="text-sm text-muted-foreground">Ultra minimal</p>
          </div>

          {/* Option 5: Sunrise with Sky Gradient Effect */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Option 5: Layered Dawn</h2>
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Multiple horizon layers */}
                <path d="M 6 34 L 42 34" stroke="currentColor" strokeWidth="2" className="text-primary" opacity="0.3" />
                <path d="M 6 30 L 42 30" stroke="currentColor" strokeWidth="2" className="text-primary" opacity="0.6" />
                <path d="M 6 26 L 42 26" stroke="currentColor" strokeWidth="2" className="text-primary" opacity="0.4" />
                {/* Sun */}
                <circle cx="24" cy="20" r="8" fill="currentColor" className="text-primary" />
                {/* Single ray up */}
                <path d="M 24 8 L 24 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
              </svg>
              <span className="text-2xl font-bold text-primary">SOBR</span>
            </div>
            <p className="text-sm text-muted-foreground">Depth and layers</p>
          </div>

          {/* Option 6: Sunrise in Circle */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Option 6: Framed Dawn</h2>
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Outer circle frame */}
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary" />
                {/* Horizon inside */}
                <path d="M 10 28 L 38 28" stroke="currentColor" strokeWidth="2" className="text-primary" />
                {/* Sun */}
                <circle cx="24" cy="28" r="6" fill="currentColor" className="text-primary" />
                {/* Rays */}
                <path d="M 24 16 L 24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
              </svg>
              <span className="text-2xl font-bold text-primary">SOBR</span>
            </div>
            <p className="text-sm text-muted-foreground">Contained and focused</p>
          </div>

        </div>
      </div>
    </div>
  );
}

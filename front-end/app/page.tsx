import Link from "next/link";
import { ArrowRight, Code2, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              Mock APIs in Seconds
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
              Instantly create, test, and share mock APIs without signing up.
              Perfect for frontend development, prototyping, and testing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/create"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Create New API
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background/50 backdrop-blur-sm px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              View on GitHub
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              title="Instant Setup"
              description="No login required. Define your JSON response and get a live endpoint immediately."
            />
            <FeatureCard
              icon={<Code2 className="h-6 w-6 text-blue-400" />}
              title="Full Control"
              description="Customize HTTP methods, status codes, and response headers to match your needs."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-green-400" />}
              title="Private & Secure"
              description="Your mock APIs are generated with unique IDs, keeping your test data isolated."
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <div className="p-3 rounded-full bg-primary/10 ring-1 ring-primary/20 mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">
        {description}
      </p>
    </div>
  );
}

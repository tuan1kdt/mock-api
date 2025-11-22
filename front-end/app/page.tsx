"use client";

import Link from "next/link";
import { ArrowRight, Code2, Zap, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-hidden relative selection:bg-primary/30">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[12000ms]" />
      <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-10 text-center">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 max-w-4xl"
          >
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-primary-foreground backdrop-blur-md mb-4">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent font-bold">New:</span>
              <span className="ml-2 text-muted-foreground">Anonymous API Creation</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
              <span className="block text-foreground">Mock APIs</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-2">
                in Seconds
              </span>
            </h1>

            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed font-light">
              Instantly create, test, and share mock APIs without signing up.
              <br className="hidden md:block" />
              Perfect for frontend development, prototyping, and testing.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link
              href="/create"
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-medium text-white shadow-lg transition-all hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center">
                Create New API
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              href="https://github.com/tuan1kdt/mock-api"
              target="_blank"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-8 text-base font-medium text-foreground shadow-sm transition-all hover:bg-white/10 hover:text-white hover:border-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              View on GitHub
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-6xl"
          >
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              title="Instant Setup"
              description="No login required. Define your JSON response and get a live endpoint immediately."
              delay={0.5}
            />
            <FeatureCard
              icon={<Code2 className="h-6 w-6 text-blue-400" />}
              title="Full Control"
              description="Customize HTTP methods, status codes, and response headers to match your needs."
              delay={0.6}
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-green-400" />}
              title="Private & Secure"
              description="Your mock APIs are generated with unique IDs, keeping your test data isolated."
              delay={0.7}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col items-center space-y-4 p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-4 rounded-full bg-white/5 ring-1 ring-white/10 group-hover:ring-white/20 transition-all mb-2 group-hover:scale-110 duration-300">
        {icon}
      </div>

      <h3 className="relative text-xl font-bold text-foreground group-hover:text-white transition-colors">
        {title}
      </h3>

      <p className="relative text-sm text-muted-foreground text-center leading-relaxed group-hover:text-gray-300 transition-colors">
        {description}
      </p>
    </motion.div>
  );
}

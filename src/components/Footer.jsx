import React from "react";
import { BrainCircuit, Heart, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand logo & tagline */}
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
              NeuroMorphix
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>

          {/* Premium tag */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Powered by</span>
            <Cpu className="h-3.5 w-3.5 text-blue-500" />
            <span>Biological intelligence. Made with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for Hackathon Candidates.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

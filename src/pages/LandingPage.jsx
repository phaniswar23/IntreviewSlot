import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden gradient-bg px-4 sm:px-6">
      {/* Background Hero Glowing Circles */}
      <div className="gradient-hero-glow w-[250px] h-[250px] -top-10 -left-10 sm:w-[500px] sm:h-[500px] sm:-top-20 sm:-left-20"></div>
      <div className="gradient-hero-glow w-[250px] h-[250px] bottom-[5%] -right-10 sm:w-[500px] sm:h-[500px] sm:bottom-[10%] sm:-right-20"></div>

      <div className="relative max-w-2xl w-full text-center py-8 flex flex-col items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full"
        >
          {/* Stylized NeuroMorphix Gradient Logo */}
          <div className="w-24 h-16 sm:w-28 sm:h-20 mb-8 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.25)] select-none">
            <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path 
                d="M30,48 C15,48 10,38 10,28 C10,15 22,8 35,18 C50,28 70,48 85,48 C98,48 110,38 110,28 C110,15 98,8 85,18 C70,28 50,48 30,48 Z" 
                stroke="url(#logo-grad)" 
                strokeWidth="13" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading designed for perfect mobile wrapping */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight text-slate-900 dark:text-white">
            Book Your <br className="sm:hidden" />
            <span className="gradient-text block sm:inline my-1">NeuroMorphix</span> <br className="sm:hidden" />
            Interview
          </h1>
          
          <p className="text-xs.5 sm:text-base md:text-lg text-slate-600 dark:text-slate-350 max-w-md sm:max-w-lg mb-8 px-2.5 leading-relaxed">
            Welcome to the official Interview Slot Booking Portal for NeuroMorphix. 
            Select your preferred interview date and time.
          </p>

          <Link
            to="/book"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 sm:px-8 sm:py-4 text-xs.5 sm:text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            Book Interview Slot
            <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

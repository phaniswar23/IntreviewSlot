import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight, AlertCircle, ShieldAlert } from "lucide-react";
import GlassCard from "../components/GlassCard";

export default function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid authentication credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="gradient-hero-glow w-[350px] h-[350px] top-[20%] -left-10"></div>

      <div className="w-full max-w-md relative">
        <GlassCard hoverEffect={false} className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 mb-4 border border-indigo-200/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="text-xl.5 font-bold tracking-tight">NeuroMorphix Admin Portal</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to manage interview slots, candidates, and analytics.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@neuromorphix.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-450 dark:text-slate-505 mt-1 block">
                * Local Mock Hint: Email is `admin@neuromorphix.ai` and password is `admin112233`
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-600 text-white font-semibold py-3 text-sm shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Authenticating..." : "Sign In to Console"}
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

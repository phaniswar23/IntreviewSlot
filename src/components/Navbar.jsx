import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { BrainCircuit, ShieldAlert, LogOut, CheckSquare } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/55 dark:border-slate-800/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 shadow-md group-hover:scale-105 transition-transform duration-300">
            <BrainCircuit className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              NeuroMorphix
            </span>
            <span className="block text-[10px] text-indigo-500 font-semibold uppercase tracking-wider -mt-1">
              Biological AI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive("/") 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/book"
            className={`text-sm font-medium transition-colors ${
              isActive("/book") 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Book Slot
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  isActive("/admin")
                    ? "bg-indigo-50/50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350"
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-450 dark:hover:text-rose-350 transition-colors"
                title="Logout admin session"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className={`text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white ${
                isActive("/admin") ? "text-indigo-600 dark:text-indigo-400" : ""
              }`}
            >
              Admin Portal
            </Link>
          )}

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useBooking } from "../context/BookingContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  FileText, 
  AlertCircle, 
  Check, 
  Sparkles, 
  ArrowRight 
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import confetti from "canvas-confetti";

export default function BookSlotPage() {
  const navigate = useNavigate();
  const { slots, bookSlot, loading } = useBooking();
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for auto-scroll functionality
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: "onTouched"
  });

  // Calculate grouped slot counts by date
  const dateGroups = slots.reduce((acc, slot) => {
    if (slot.isDisabled) return acc;
    if (!acc[slot.date]) {
      acc[slot.date] = {
        dateStr: slot.date,
        total: 0,
        available: 0,
        slots: []
      };
    }
    acc[slot.date].total += 1;
    if (!slot.isBooked) {
      acc[slot.date].available += 1;
    }
    acc[slot.date].slots.push(slot);
    return acc;
  }, {});

  // Filter out dates that do NOT have active/available slots
  const availableDates = Object.values(dateGroups)
    .filter(group => group.available > 0)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  // Find the selected date group
  const selectedDateGroup = dateGroups[selectedDate];
  const slotsForSelectedDate = selectedDateGroup 
    ? [...selectedDateGroup.slots].sort((a, b) => a.time.localeCompare(b.time))
    : [];

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlotId(""); // Reset slot when date changes
    setErrorMessage("");

    // Auto scroll to step 2 after brief delay
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleSlotSelect = (slotId) => {
    setSelectedSlotId(slotId);
    setErrorMessage("");

    // Auto scroll to step 3 after brief delay
    setTimeout(() => {
      step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getFormattedDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const onSubmit = async (data) => {
    if (!selectedSlotId) {
      setErrorMessage("Please select an interview time slot.");
      return;
    }
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const confirmedBooking = await bookSlot(selectedSlotId, data);
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      navigate("/confirmation", { state: { booking: confirmedBooking } });
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine current active step progress
  const currentStep = selectedSlotId ? 3 : selectedDate ? 2 : 1;

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
        {/* Loading Skeletons */}
        <div className="w-full max-w-xl space-y-6">
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mx-auto"></div>
          <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mx-auto"></div>
          <div className="space-y-3">
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen gradient-bg py-10 px-4 sm:px-6">
      {/* Background glow effects */}
      <div className="gradient-hero-glow w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] top-[10%] -left-10"></div>
      
      <div className="mx-auto max-w-2xl relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-8 px-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Book Your <span className="gradient-text">Interview Slot</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            NeuroMorphix candidate scheduling dashboard. Complete in under 1 minute.
          </p>
        </div>

        {/* PROGRESS STEP BAR */}
        <div className="flex items-center justify-between mb-10 max-w-md mx-auto px-4 relative">
          {/* Progress bar background */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
          {/* Active progress fill */}
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-500 z-0 transition-all duration-300"
            style={{ width: `${currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'}` }}
          ></div>

          {[1, 2, 3].map((step) => {
            const isCompleted = currentStep > step;
            const isActive = currentStep === step;
            return (
              <div key={step} className="flex flex-col items-center z-10 relative">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted 
                      ? "bg-indigo-600 text-white" 
                      : isActive 
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20" 
                      : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5 text-slate-450 dark:text-slate-500">
                  {step === 1 ? "Date" : step === 2 ? "Time" : "Details"}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP CHECKLIST FLOW */}
        <div className="space-y-8">
          
          {/* STEP 1: Select Interview Date */}
          <GlassCard hoverEffect={false} className="p-5 sm:p-6 rounded-[20px] border-none shadow-md">
            <div className="flex items-center gap-2.5 mb-5">
              <CalendarIcon className="h-5 w-5 text-indigo-500" />
              <h2 className="text-base sm:text-lg font-bold">Step 1 — Select Interview Date</h2>
            </div>

            {availableDates.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">All interview slots are currently booked. Please check back later.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableDates.map((group) => {
                  const isSelected = selectedDate === group.dateStr;
                  return (
                    <button
                      key={group.dateStr}
                      onClick={() => handleDateSelect(group.dateStr)}
                      className={`w-full flex items-center justify-between p-4.5 rounded-xl border text-left transition-all duration-200 group active:scale-[0.99] min-h-[48px] ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-indigo-500/20 scale-[1.01]"
                          : "bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 hover:bg-indigo-500/5 hover:border-indigo-400/55 text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-white/20" : "bg-indigo-500/10"}`}>
                          <CalendarIcon className={`h-4.5 w-4.5 ${isSelected ? "text-white" : "text-indigo-500"}`} />
                        </div>
                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-indigo-100" : "text-slate-450"}`}>
                            {getDayName(group.dateStr)}
                          </div>
                          <div className="text-sm font-semibold mt-0.5">
                            {getFormattedDate(group.dateStr)}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        isSelected 
                          ? "bg-white/20 text-white" 
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      }`}>
                        {group.available} {group.available === 1 ? "Slot" : "Slots"} Available
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* STEP 2: Select Time Slot */}
          <div ref={step2Ref}>
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <GlassCard hoverEffect={false} className="p-5 sm:p-6 rounded-[20px] border-none shadow-md">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-5 w-5 text-indigo-500" />
                        <h2 className="text-base sm:text-lg font-bold">Step 2 — Select Time Slot</h2>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 text-indigo-500">
                        {getFormattedDate(selectedDate)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slotsForSelectedDate.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        const isBooked = slot.isBooked;

                        return (
                          <button
                            key={slot.id}
                            disabled={isBooked}
                            onClick={() => handleSlotSelect(slot.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 min-h-[48px] active:scale-[0.97] ${
                              isBooked
                                ? "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 text-slate-400 cursor-not-allowed line-through"
                                : isSelected
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md scale-[1.02]"
                                : "bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:border-indigo-400/50 text-slate-800 dark:text-slate-100"
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-semibold">{slot.time}</span>
                            <span className="text-[9px] opacity-75 mt-0.5 uppercase tracking-wider">
                              {isBooked ? "Booked" : "Available"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 3: Candidate Information Form */}
          <div ref={step3Ref}>
            <AnimatePresence>
              {selectedSlotId && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <GlassCard hoverEffect={false} className="p-5 sm:p-6 rounded-[20px] border-none shadow-md">
                    <div className="flex items-center gap-2.5 mb-5">
                      <User className="h-5 w-5 text-indigo-500" />
                      <h2 className="text-base sm:text-lg font-bold">Step 3 — Candidate Information</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Jane Doe"
                            {...register("name", { required: "Full name is required" })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 focus:ring-2 focus:ring-indigo-500 outline-none text-xs.5 transition-all min-h-[48px]"
                          />
                        </div>
                        {errors.name && (
                          <span className="text-xs text-rose-500 mt-1 block font-medium">{errors.name.message}</span>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            placeholder="jane.doe@example.com"
                            {...register("email", { 
                              required: "Email is required",
                              pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                message: "Please enter a valid email address"
                              }
                            })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 focus:ring-2 focus:ring-indigo-500 outline-none text-xs.5 transition-all min-h-[48px]"
                          />
                        </div>
                        {errors.email && (
                          <span className="text-xs text-rose-500 mt-1 block font-medium">{errors.email.message}</span>
                        )}
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            {...register("mobile", { 
                              required: "Mobile number is required",
                              pattern: {
                                value: /^\+?[0-9\s-]{10,15}$/,
                                message: "Please enter a valid phone number"
                              }
                            })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 focus:ring-2 focus:ring-indigo-500 outline-none text-xs.5 transition-all min-h-[48px]"
                          />
                        </div>
                        {errors.mobile && (
                          <span className="text-xs text-rose-500 mt-1 block font-medium">{errors.mobile.message}</span>
                        )}
                      </div>

                      {/* College */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          College / University *
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="NeuroMorphix Institute of Tech"
                            {...register("college", { required: "College name is required" })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 focus:ring-2 focus:ring-indigo-500 outline-none text-xs.5 transition-all min-h-[48px]"
                          />
                        </div>
                        {errors.college && (
                          <span className="text-xs text-rose-500 mt-1 block font-medium">{errors.college.message}</span>
                        )}
                      </div>

                      {/* Registration ID */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Registration ID (Optional)
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="REG-948271"
                            {...register("registrationId")}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 focus:ring-2 focus:ring-indigo-500 outline-none text-xs.5 transition-all min-h-[48px]"
                          />
                        </div>
                      </div>

                      {/* SUMMARY PREVIEW */}
                      <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 grid grid-cols-2 gap-4 text-xs.5">
                        <div className="bg-slate-100/40 dark:bg-slate-900/40 p-3 rounded-xl">
                          <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider">Selected Date</span>
                          <span className="font-semibold text-slate-805 dark:text-white block mt-0.5">
                            {getFormattedDate(selectedDate)}
                          </span>
                        </div>
                        <div className="bg-slate-100/40 dark:bg-slate-900/40 p-3 rounded-xl">
                          <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider">Selected Time</span>
                          <span className="font-semibold text-indigo-500 block mt-0.5">
                            {slots.find(s => s.id === selectedSlotId)?.time}
                          </span>
                        </div>
                      </div>

                      {/* Error Message */}
                      {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 text-xs font-medium flex items-start gap-2">
                          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Submit Booking CTA */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-3.5 text-sm shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[48px]"
                      >
                        {isSubmitting ? "Registering Interview..." : "Book Interview"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { CheckCircle2, Calendar, Clock, AlertTriangle, ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import GlassCard from "../components/GlassCard";

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cancelBooking, slots, rescheduleBooking } = useBooking();
  const booking = location.state?.booking;

  const [message, setMessage] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState("");

  if (!booking) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <GlassCard className="max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Booking Record Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Please register on the booking portal first.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Booking
          </Link>
        </GlassCard>
      </div>
    );
  }

  // Calculate hours until interview
  const interviewDateTime = new Date(`${booking.date} ${booking.time}`);
  const timeDiff = interviewDateTime.getTime() - new Date().getTime();
  const hoursUntilInterview = timeDiff / (1000 * 60 * 60);
  const isDeadlinePassed = hoursUntilInterview < 24;

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this interview booking?")) {
      setIsCancelling(true);
      setMessage("");
      try {
        await cancelBooking(booking.bookingId);
        setMessage("Your booking has been successfully cancelled.");
      } catch (err) {
        setMessage(err.message || "Failed to cancel booking.");
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handleReschedule = async () => {
    if (!selectedNewSlotId) {
      setMessage("Please choose a new slot first.");
      return;
    }
    setIsRescheduling(true);
    setMessage("");
    try {
      await rescheduleBooking(booking.bookingId, selectedNewSlotId);
      setMessage("Your booking has been successfully rescheduled!");
      // Update local state value for date and time details display
      const newSlot = slots.find(s => s.id === selectedNewSlotId);
      booking.date = newSlot.date;
      booking.time = newSlot.time;
      booking.slotId = selectedNewSlotId;
      setSelectedNewSlotId("");
    } catch (err) {
      setMessage(err.message || "Failed to reschedule booking.");
    } finally {
      setIsRescheduling(false);
    }
  };

  // Find other available slots candidate can reschedule to
  const availableRescheduleSlots = slots
    .filter(s => !s.isBooked && !s.isDisabled && s.id !== booking.slotId)
    .slice(0, 6);

  return (
    <div className="min-h-screen gradient-bg py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <GlassCard hoverEffect={false} className="relative overflow-hidden mb-6 p-8">
          {/* Confetti decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-bl-full pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 mb-4">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Booking Confirmed</h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Your interview has been successfully scheduled.
            </p>
          </div>

          {/* Details Grid */}
          <div className="bg-slate-100/50 dark:bg-slate-900/35 border border-slate-200/55 dark:border-slate-800/40 rounded-2xl p-5 mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Booking ID</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{booking.bookingId}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 mt-0.5">
                  Scheduled
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Candidate Name</span>
                <span className="text-sm font-semibold">{booking.name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Email Address</span>
                <span className="text-sm font-medium">{booking.email}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">College / Institution</span>
                <span className="text-sm font-medium">{booking.college}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Mobile Number</span>
                <span className="text-sm font-medium">{booking.mobile}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-indigo-500 shrink-0" />
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Interview Date</span>
                  <span className="text-xs.5 font-bold">
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-indigo-500 shrink-0" />
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Interview Time</span>
                  <span className="text-xs.5 font-bold">{booking.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback/Confirmation banner */}
          {message && (
            <div className="mb-6 p-3 text-center text-sm font-medium rounded-xl border bg-indigo-500/10 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
              {message}
            </div>
          )}

          {/* Cancellation / Rescheduling Deadline Warnings & Actions */}
          <div className="space-y-6">

            {!isDeadlinePassed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex items-center justify-center gap-2 border border-rose-200 hover:border-rose-400/50 hover:bg-rose-500/10 text-rose-600 dark:border-rose-900 dark:hover:bg-rose-950/20 dark:text-rose-400 font-semibold py-2.5 px-4 rounded-xl text-xs.5 transition-all disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isCancelling ? "Cancelling..." : "Cancel Appointment"}
                </button>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-medium">Or reschedule to a new slot:</span>
                  <div className="flex gap-2">
                    <select
                      value={selectedNewSlotId}
                      onChange={(e) => setSelectedNewSlotId(e.target.value)}
                      className="flex-1 text-xs.5 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Choose slot...</option>
                      {availableRescheduleSlots.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.date} - {s.time}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleReschedule}
                      disabled={isRescheduling || !selectedNewSlotId}
                      className="flex items-center justify-center p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
                      title="Reschedule now"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs.5 font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Home page
          </Link>
        </div>
      </div>
    </div>
  );
}

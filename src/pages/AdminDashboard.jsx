import React, { useState, useEffect } from "react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  HelpCircle, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  Activity, 
  Award, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Sun, 
  Moon, 
  Briefcase, 
  MapPin, 
  Menu, 
  X, 
  ChevronDown, 
  FileSpreadsheet, 
  BookOpen,
  Eye,
  Mail,
  MoreVertical,
  UserCheck,
  UserX,
  PlusCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import GlassCard from "../components/GlassCard";

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const { 
    slots, 
    candidates, 
    addSlot, 
    deleteSlot, 
    toggleSlotDisabledStatus, 
    bulkCreateSlots, 
    updateCandidateStatus,
    cancelBooking 
  } = useBooking();

  // Authentication check
  if (!currentUser) {
    return <Navigate to="/admin" replace />;
  }

  // Dashboard Tab state
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, candidates, slots, analytics, settings
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [collegeFilter, setCollegeFilter] = useState("All");

  // Pagination State
  const [candidatePage, setCandidatePage] = useState(1);
  const candidatePageSize = 8;

  // Active Dropdown Action Row ID
  const [activeActionRowId, setActiveActionRowId] = useState(null);

  // Drawer / Modal States
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Single Slot form state
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("10:00 AM");
  const [slotType, setSlotType] = useState("Virtual");
  const [slotCapacity, setSlotCapacity] = useState(1);

  // Bulk Slots form state
  const [bulkStartDate, setBulkStartDate] = useState("");
  const [bulkEndDate, setBulkEndDate] = useState("");
  const [bulkStartTime, setBulkStartTime] = useState("09:00 AM");
  const [bulkEndTime, setBulkEndTime] = useState("05:00 PM");
  const [bulkDuration, setBulkDuration] = useState(30);
  const [bulkBreak, setBulkBreak] = useState(15);
  const [bulkWorkingDays, setBulkWorkingDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);

  // Toast status feedback
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Calculations & Telemetry
  const totalCandidates = candidates.length;
  const totalSlotsCount = slots.length;
  const bookedSlotsCount = slots.filter(s => s.isBooked).length;
  const availableSlotsCount = slots.filter(s => !s.isBooked && !s.isDisabled).length;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const todayInterviewsCount = slots.filter(s => s.date === todayStr && s.isBooked).length;

  const attendedCount = candidates.filter(c => c.status === "Attended").length;
  const selectedCount = candidates.filter(c => c.status === "Selected").length;
  const rejectedCount = candidates.filter(c => c.status === "Rejected").length;
  const absentCount = candidates.filter(c => c.status === "Absent").length;
  const cancelledCount = candidates.filter(c => c.status === "Cancelled").length;
  
  const totalConducted = attendedCount + absentCount;
  const attendanceRate = totalConducted > 0 ? Math.round((attendedCount / totalConducted) * 100) : 0;
  const selectionRate = totalCandidates > 0 ? Math.round((selectedCount / totalCandidates) * 100) : 0;

  // Filter candidates list
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bookingId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesDate = dateFilter === "All" || c.date === dateFilter;
    const matchesCollege = collegeFilter === "All" || c.college === collegeFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesCollege;
  });

  // Pagination Calculations
  const paginatedCandidates = filteredCandidates.slice(
    (candidatePage - 1) * candidatePageSize,
    candidatePage * candidatePageSize
  );
  const totalCandidatePages = Math.ceil(filteredCandidates.length / candidatePageSize) || 1;

  // Group slots by date for slot list timeline
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSlots).sort();

  // Create Single Slot Action
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!slotDate || !slotTime) return;
    try {
      await addSlot({ date: slotDate, time: slotTime });
      triggerToast("Interview slot successfully created.");
      setIsAddModalOpen(false);
      setSlotDate("");
    } catch (err) {
      triggerToast(err.message || "Failed to add slot.");
    }
  };

  // Bulk Create Slots Action
  const handleBulkCreate = async (e) => {
    e.preventDefault();
    if (!bulkStartDate || !bulkEndDate) return;
    try {
      const dates = [];
      const current = new Date(bulkStartDate + "T00:00:00");
      const end = new Date(bulkEndDate + "T00:00:00");
      while (current <= end) {
        const dayOfWeek = current.toLocaleDateString("en-US", { weekday: "long" });
        if (bulkWorkingDays.includes(dayOfWeek)) {
          dates.push(current.toISOString().split("T")[0]);
        }
        current.setDate(current.getDate() + 1);
      }

      const times = [];
      let startTimeMin = parseTimeToMinutes(bulkStartTime);
      const endTimeMin = parseTimeToMinutes(bulkEndTime);

      while (startTimeMin + parseInt(bulkDuration) <= endTimeMin) {
        times.push(formatMinutesToTime(startTimeMin));
        startTimeMin += parseInt(bulkDuration) + parseInt(bulkBreak);
      }

      await bulkCreateSlots(dates, times);
      triggerToast(`Successfully bulk created slots for ${dates.length} days.`);
      setIsBulkModalOpen(false);
    } catch (err) {
      triggerToast(err.message || "Failed to generate bulk schedule.");
    }
  };

  // Helper parsing functions
  const parseTimeToMinutes = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const modifier = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${modifier}`;
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await deleteSlot(id);
        triggerToast("Slot successfully deleted.");
      } catch (err) {
        triggerToast(err.message);
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this candidate booking?")) {
      try {
        await cancelBooking(bookingId);
        triggerToast("Candidate booking cancelled. Slot is now available.");
        setSelectedCandidate(null);
      } catch (err) {
        triggerToast(err.message);
      }
    }
  };

  const handleMarkStatus = async (candId, status) => {
    try {
      await updateCandidateStatus(candId, status);
      triggerToast(`Candidate status marked as ${status}.`);
      if (selectedCandidate && selectedCandidate.id === candId) {
        setSelectedCandidate({ ...selectedCandidate, status });
      }
    } catch (err) {
      triggerToast(err.message);
    }
  };

  // Trigger mail client with meet link template
  const handleMailTrigger = (candidate) => {
    const subject = encodeURIComponent("NeuroMorphix Interview Meeting Link");
    const body = encodeURIComponent(
      `Hello ${candidate.name},\n\n` +
      `Here is the meeting link for your scheduled NeuroMorphix interview:\n\n` +
      `Date: ${candidate.date}\n` +
      `Time: ${candidate.time}\n` +
      `Booking ID: ${candidate.bookingId}\n\n` +
      `Meeting Link: [Insert Google Meet / Zoom link here]\n\n` +
      `Please join on time. If you have any questions, feel free to reply to this email.\n\n` +
      `Best regards,\n` +
      `NeuroMorphix Recruitment Team`
    );
    window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
  };

  // Export filtered candidates to CSV
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) return;
    const headers = ["Booking ID", "Name", "Email", "Mobile", "College", "Reg ID", "Interview Date", "Time", "Status"];
    const rows = filteredCandidates.map(c => [
      c.bookingId,
      c.name,
      c.email,
      c.mobile,
      c.college,
      c.registrationId || "N/A",
      c.date,
      c.time,
      c.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NeuroMorphix_Registry_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique lists for selectors
  const uniqueColleges = [...new Set(candidates.map(c => c.college))];
  const uniqueDates = [...new Set(slots.map(s => s.date))].sort();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* SIDEBAR - DESKTOP & TABLET */}
      <aside 
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-60"
        } shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800/40">
          {!isSidebarCollapsed && (
            <span className="font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              NeuroMorphix
            </span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 mx-auto"
          >
            <ChevronLeft className={`h-4.5 w-4.5 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {[
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "candidates", label: "Candidates", icon: Users },
            { id: "slots", label: "Interview Slots", icon: Calendar },
            { id: "analytics", label: "Analytics", icon: Award }
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <Download className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && <span>Export Registry</span>}
          </button>
        </nav>

        {/* LOGOUT */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/40">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold tracking-tight capitalize hidden md:block">
              {activeTab} Overview
            </h2>

            {/* Candidate Search bar */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action items */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* DASHBOARD CONTENT BODY */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto pb-24 md:pb-6">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 animate-fade-in"
              >
                {/* Responsive Overview stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Candidates", val: totalCandidates, icon: Users, color: "text-blue-500", trend: "+3 Today" },
                    { label: "Booked Slots", val: bookedSlotsCount, icon: CheckCircle, color: "text-emerald-500", trend: `${bookedSlotsCount} Filled` },
                    { label: "Available Slots", val: availableSlotsCount, icon: Clock, color: "text-amber-500", trend: `${availableSlotsCount} Empty` },
                    { label: "Today's Appts", val: todayInterviewsCount, icon: Calendar, color: "text-indigo-500", trend: "Active Today" },
                    { label: "Selected", val: selectedCount, icon: Award, color: "text-purple-500", trend: `${selectedCount} Accepted` },
                    { label: "Attendance", val: `${attendanceRate}%`, icon: Activity, color: "text-teal-500", trend: "Conducted" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center text-slate-400 mb-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider">{stat.label}</span>
                        <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold tracking-tight">{stat.val}</div>
                        <div className="text-[9px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-indigo-500" />
                          {stat.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dashboard bottom half: populous layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Registrations Table */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest Registrations</h3>
                      <button onClick={() => setActiveTab("candidates")} className="text-xs text-indigo-500 font-bold hover:underline">
                        View All
                      </button>
                    </div>

                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400 uppercase font-semibold">
                            <th className="pb-3 pr-2">Booking ID</th>
                            <th className="pb-3 pr-2">Candidate</th>
                            <th className="pb-3 pr-2">Schedule</th>
                            <th className="pb-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                          {candidates.slice(0, 4).map((cand) => (
                            <tr key={cand.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/20 transition-colors">
                              <td className="py-3 font-semibold text-indigo-600 dark:text-indigo-400 pr-2">{cand.bookingId}</td>
                              <td className="py-3 pr-2">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{cand.name}</div>
                                <div className="text-[10px] text-slate-400">{cand.college}</div>
                              </td>
                              <td className="py-3 pr-2">
                                <div>{cand.date}</div>
                                <div className="text-[10px] text-slate-400">{cand.time}</div>
                              </td>
                              <td className="py-3 text-right">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  cand.status === "Selected" 
                                    ? "bg-purple-500/10 text-purple-600"
                                    : cand.status === "Rejected"
                                    ? "bg-rose-500/10 text-rose-600"
                                    : cand.status === "Cancelled"
                                    ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    : cand.status === "Attended"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-blue-500/10 text-blue-600"
                                }`}>
                                  {cand.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {candidates.length === 0 && (
                            <tr>
                              <td colSpan="4" className="text-center py-6 text-slate-400 italic">No candidates registered yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Upcoming Interviews & Activity */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Interviews</h3>
                    <div className="space-y-3">
                      {candidates
                        .filter(c => c.status === "Booked")
                        .slice(0, 3)
                        .map((c) => (
                          <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-800/30 text-xs">
                            <div>
                              <div className="font-bold">{c.name}</div>
                              <div className="text-[10px] text-slate-400">{c.college}</div>
                            </div>
                            <div className="text-right">
                              <span className="block font-semibold text-indigo-500">{c.time}</span>
                              <span className="text-[9px] text-slate-400">{c.date}</span>
                            </div>
                          </div>
                        ))}
                      {candidates.filter(c => c.status === "Booked").length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-6">No upcoming interviews scheduled.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: CANDIDATES MANAGEMENT TABLE */}
            {activeTab === "candidates" && (
              <motion.div
                key="candidates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Search & Filters row */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-4.5 rounded-2xl shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCandidatePage(1); }}
                        className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Booked">Scheduled</option>
                        <option value="Attended">Attended</option>
                        <option value="Absent">Absent</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Date</label>
                      <select
                        value={dateFilter}
                        onChange={(e) => { setDateFilter(e.target.value); setCandidatePage(1); }}
                        className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="All">All Dates</option>
                        {uniqueDates.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">College</label>
                      <select
                        value={collegeFilter}
                        onChange={(e) => { setCollegeFilter(e.target.value); setCandidatePage(1); }}
                        className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="All">All Colleges</option>
                        {uniqueColleges.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 text-xs h-9"
                  >
                    <Download className="h-4 w-4" /> Export CSV
                  </button>
                </div>

                {/* Candidate Registry Data Table & Responsive Cards */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm overflow-hidden">
                  {filteredCandidates.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <div className="h-16 w-16 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Users className="h-8 w-8" />
                      </div>
                      <h4 className="font-bold text-slate-850 dark:text-slate-200">No interview bookings yet</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                        Interview bookings will appear here once candidates start scheduling.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* DESKTOP TABLE VIEW (sm and up) */}
                      <div className="hidden sm:block sm:overflow-visible overflow-x-auto text-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 uppercase font-semibold">
                              <th className="p-4">Booking ID</th>
                              <th className="p-4">Candidate</th>
                              <th className="p-4">College</th>
                              <th className="p-4">Interview Schedule</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {paginatedCandidates.map((cand) => (
                              <tr key={cand.id} className="hover:bg-slate-50/10 dark:hover:bg-slate-850/10 transition-colors">
                                <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{cand.bookingId}</td>
                                <td className="p-4">
                                  <div className="font-bold text-slate-850 dark:text-slate-100">{cand.name}</div>
                                  <div className="text-[10px] text-slate-400">{cand.email} | {cand.mobile}</div>
                                </td>
                                <td className="p-4 truncate max-w-[150px]">{cand.college}</td>
                                <td className="p-4">
                                  <div className="font-semibold">{cand.date}</div>
                                  <div className="text-[10px] text-slate-400">{cand.time}</div>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                                    cand.status === "Selected" 
                                      ? "bg-purple-500/10 text-purple-650"
                                      : cand.status === "Rejected"
                                      ? "bg-rose-500/10 text-rose-600"
                                      : cand.status === "Cancelled"
                                      ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                      : cand.status === "Attended"
                                      ? "bg-emerald-500/10 text-emerald-650"
                                      : "bg-blue-500/10 text-blue-600"
                                  }`}>
                                    {cand.status === "Booked" ? "Scheduled" : cand.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2 relative">
                                    {/* Action triggers: 👁, ✉, ⋮ */}
                                    <button
                                      onClick={() => setSelectedCandidate(cand)}
                                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-850 bg-white hover:bg-slate-100/50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200"
                                      title="View Details"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleMailTrigger(cand)}
                                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-850 bg-white hover:bg-slate-100/50 dark:bg-slate-900 dark:hover:bg-slate-800 text-indigo-500 dark:text-indigo-400"
                                      title="Send Mail"
                                    >
                                      <Mail className="h-3.5 w-3.5" />
                                    </button>

                                    <div className="relative">
                                      <button
                                        onClick={() => setActiveActionRowId(activeActionRowId === cand.id ? null : cand.id)}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-855 bg-white hover:bg-slate-100/50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </button>

                                      {/* Action Dropdown Menu */}
                                      {activeActionRowId === cand.id && (
                                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 text-left py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-350">
                                          <button 
                                            onClick={() => { setSelectedCandidate(cand); setActiveActionRowId(null); }}
                                            className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                          >
                                            <Eye className="h-3.5 w-3.5 text-slate-400" /> View Details
                                          </button>
                                          <button 
                                            onClick={() => { handleMailTrigger(cand); setActiveActionRowId(null); }}
                                            className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                          >
                                            <Mail className="h-3.5 w-3.5 text-indigo-400" /> Send Mail
                                          </button>
                                          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1"></div>
                                          <button 
                                            onClick={() => { handleMarkStatus(cand.id, "Attended"); setActiveActionRowId(null); }}
                                            className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 flex items-center gap-2"
                                          >
                                            <UserCheck className="h-3.5 w-3.5" /> Mark Attended
                                          </button>
                                          <button 
                                            onClick={() => { handleMarkStatus(cand.id, "Selected"); setActiveActionRowId(null); }}
                                            className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-purple-650 flex items-center gap-2"
                                          >
                                            <Award className="h-3.5 w-3.5" /> Mark Selected
                                          </button>
                                          <button 
                                            onClick={() => { handleMarkStatus(cand.id, "Rejected"); setActiveActionRowId(null); }}
                                            className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-500 flex items-center gap-2"
                                          >
                                            <UserX className="h-3.5 w-3.5" /> Mark Rejected
                                          </button>
                                          <button 
                                            onClick={() => { handleCancelBooking(cand.bookingId); setActiveActionRowId(null); }}
                                            className="w-full px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 flex items-center gap-2"
                                          >
                                            <X className="h-3.5 w-3.5" /> Cancel Booking
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* MOBILE CARD VIEW (xs and up to sm) */}
                      <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/40">
                        {paginatedCandidates.map((cand) => (
                          <div key={cand.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-150 text-sm">{cand.name}</h4>
                                <span className="text-[10px] text-slate-400 font-semibold">{cand.bookingId}</span>
                              </div>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                cand.status === "Selected" 
                                  ? "bg-purple-500/10 text-purple-600"
                                  : cand.status === "Rejected"
                                  ? "bg-rose-500/10 text-rose-600"
                                  : cand.status === "Cancelled"
                                  ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  : cand.status === "Attended"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-blue-500/10 text-blue-600"
                              }`}>
                                {cand.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                              <div>
                                <span className="block text-[8px] font-bold text-slate-405 uppercase">College</span>
                                <span className="font-semibold">{cand.college}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-bold text-slate-405 uppercase">Schedule</span>
                                <span className="font-semibold">{cand.date} at {cand.time}</span>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/30">
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg bg-slate-50 dark:bg-slate-900 min-h-[36px]"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleMailTrigger(cand)}
                                className="px-3.5 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg min-h-[36px]"
                              >
                                Send Link
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs text-slate-400">
                          Page <b>{candidatePage}</b> of <b>{totalCandidatePages}</b> ({filteredCandidates.length} total)
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={candidatePage === 1}
                            onClick={() => setCandidatePage(candidatePage - 1)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 disabled:opacity-40"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            disabled={candidatePage === totalCandidatePages}
                            onClick={() => setCandidatePage(candidatePage + 1)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 disabled:opacity-40"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: SLOTS TIMELINE AND MANAGEMENT */}
            {activeTab === "slots" && (
              <motion.div
                key="slots"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header slots config */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="font-bold text-slate-850 dark:text-white">Interview Slots Registry</h3>
                  <div className="flex gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={() => setIsBulkModalOpen(true)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors h-11"
                    >
                      Bulk Create Slots
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white px-4 py-2.5 text-xs font-semibold hover:bg-indigo-500 transition-colors h-11"
                    >
                      <Plus className="h-4 w-4" /> Add Single Slot
                    </button>
                  </div>
                </div>

                {/* Slots grouped timeline lists */}
                {sortedDates.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h4 className="font-bold">No slots generated yet</h4>
                    <p className="text-xs text-slate-450 dark:text-slate-500 mb-6">Create slots to configure applicant dates.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedDates.map((date) => (
                      <div key={date} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm">
                        <h4 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800/50 pb-3 mb-4 text-indigo-500">
                          {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {groupedSlots[date].map((s) => {
                            const matchingCandidate = candidates.find(c => c.slotId === s.id && c.status !== "Cancelled");
                            return (
                              <div 
                                key={s.id} 
                                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs.5 ${
                                  s.isBooked 
                                    ? "bg-purple-500/5 border-purple-500/20" 
                                    : s.isDisabled 
                                    ? "bg-slate-50 border-slate-200/40 dark:bg-slate-950 dark:border-slate-850" 
                                    : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/40"
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-sm text-slate-850 dark:text-white block">{s.time}</span>
                                    {s.isBooked && matchingCandidate ? (
                                      <span className="text-[10px] text-slate-450 mt-1 block">
                                        Booked: <b>{matchingCandidate.name}</b>
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-slate-400 mt-1 block">
                                        {s.isDisabled ? "Disabled" : "Available"}
                                      </span>
                                    )}
                                  </div>

                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    s.isBooked 
                                      ? "bg-purple-500/10 text-purple-650" 
                                      : s.isDisabled 
                                      ? "bg-slate-100 text-slate-500" 
                                      : "bg-emerald-500/10 text-emerald-600"
                                  }`}>
                                    {s.isBooked ? "Booked" : s.isDisabled ? "Inactive" : "Available"}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
                                  {s.isBooked && matchingCandidate ? (
                                    <button 
                                      onClick={() => setSelectedCandidate(matchingCandidate)}
                                      className="text-xs text-indigo-500 font-bold hover:underline"
                                    >
                                      View Details
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => toggleSlotDisabledStatus(s.id)}
                                      className="text-slate-500 hover:text-indigo-500 font-bold"
                                    >
                                      {s.isDisabled ? "Enable" : "Disable"}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteSlot(s.id)}
                                    disabled={s.isBooked}
                                    className="text-rose-500 hover:bg-rose-500/10 p-1 rounded-lg disabled:opacity-30"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: ANALYTICS GRAPHS */}
            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status distribution */}
                  <GlassCard hoverEffect={false} className="p-5 border-none shadow-sm">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Registration Status Distribution</h4>
                    <div className="space-y-3.5 text-xs">
                      {[
                        { label: "Attended", count: attendedCount, color: "bg-emerald-500" },
                        { label: "Absent", count: absentCount, color: "bg-slate-400" },
                        { label: "Selected", count: selectedCount, color: "bg-purple-500" },
                        { label: "Rejected", count: rejectedCount, color: "bg-rose-500" },
                        { label: "Scheduled / Booked", count: candidates.filter(c => c.status === "Booked").length, color: "bg-blue-500" }
                      ].map((item, idx) => {
                        const total = Math.max(1, totalCandidates);
                        const percent = Math.round((item.count / total) * 100);
                        return (
                          <div key={idx}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold">{item.label}</span>
                              <span className="text-slate-450">{item.count} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className={`${item.color} h-full`} style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>

                  {/* College Applications */}
                  <GlassCard hoverEffect={false} className="p-5 border-none shadow-sm">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">College-wise Applications</h4>
                    <div className="space-y-3.5 text-xs">
                      {uniqueColleges.slice(0, 5).map((college, idx) => {
                        const count = candidates.filter(c => c.college === college).length;
                        const total = Math.max(1, totalCandidates);
                        const percent = Math.round((count / total) * 100);
                        return (
                          <div key={idx}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold truncate max-w-[180px]">{college}</span>
                              <span className="text-slate-455">{count} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                      {uniqueColleges.length === 0 && (
                        <p className="text-slate-400 italic text-center py-8">No applicant college data yet.</p>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/40 flex items-center justify-around z-30 px-3">
          {[
            { id: "dashboard", label: "Overview", icon: Activity },
            { id: "candidates", label: "Candidates", icon: Users },
            { id: "slots", label: "Slots", icon: Calendar },
            { id: "analytics", label: "Analytics", icon: Award }
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                  isActive ? "text-indigo-500 font-bold scale-102" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
          <button 
            onClick={logout}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-rose-500"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[9px] uppercase tracking-wider">Logout</span>
          </button>
        </nav>

      </div>

      {/* MODAL 1: ADD SINGLE SLOT */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <h4 className="font-extrabold text-lg mb-4">Add Single Interview Slot</h4>

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/45 dark:bg-slate-950/45 text-xs outline-none focus:ring-1 focus:ring-indigo-500 min-h-[48px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/45 dark:bg-slate-950/45 text-xs outline-none focus:ring-1 focus:ring-indigo-500 min-h-[48px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={slotCapacity}
                      onChange={(e) => setSlotCapacity(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/45 dark:bg-slate-955/45 text-xs outline-none min-h-[48px]"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Type</label>
                    <select
                      value={slotType}
                      onChange={(e) => setSlotType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/45 dark:bg-slate-955/45 text-xs outline-none min-h-[48px]"
                    >
                      <option value="Virtual">Virtual / Remote</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-colors mt-2 min-h-[48px]"
                >
                  Create Slot
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: BULK SLOTS MATRIX CREATOR */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute inset-0 bg-slate-955/60 backdrop-blur-xs"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <h4 className="font-extrabold text-lg mb-4">Bulk Slots Generation Matrix</h4>

              <form onSubmit={handleBulkCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={bulkStartDate}
                      onChange={(e) => setBulkStartDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/45 dark:bg-slate-950/45 text-xs outline-none focus:ring-1 focus:ring-indigo-505 min-h-[48px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={bulkEndDate}
                      onChange={(e) => setBulkEndDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/45 dark:bg-slate-955/45 text-xs outline-none focus:ring-1 focus:ring-indigo-505 min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={bulkStartTime}
                      onChange={(e) => setBulkStartTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-950/40 text-xs outline-none min-h-[48px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 05:00 PM"
                      value={bulkEndTime}
                      onChange={(e) => setBulkEndTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-950/40 text-xs outline-none min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Duration (Min)</label>
                    <input
                      type="number"
                      value={bulkDuration}
                      onChange={(e) => setBulkDuration(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/45 dark:bg-slate-950/45 text-xs outline-none min-h-[48px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Break (Min)</label>
                    <input
                      type="number"
                      value={bulkBreak}
                      onChange={(e) => setBulkBreak(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/45 dark:bg-slate-950/45 text-xs outline-none min-h-[48px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-colors mt-2 min-h-[48px]"
                >
                  Generate Slots Matrix
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: CANDIDATE DETAIL DRAWER */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            ></motion.div>

            <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="w-screen max-w-md"
              >
                <div className="h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200/50 dark:border-slate-800/40">
                  {/* Drawer Header */}
                  <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between">
                    <h3 className="text-base font-extrabold">Candidate Registry Details</h3>
                    <button 
                      onClick={() => setSelectedCandidate(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs.5">
                    
                    {/* Status badge */}
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Current Pipeline Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedCandidate.status === "Selected" 
                          ? "bg-purple-500/10 text-purple-600"
                          : selectedCandidate.status === "Rejected"
                          ? "bg-rose-500/10 text-rose-600"
                          : selectedCandidate.status === "Cancelled"
                          ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          : selectedCandidate.status === "Attended"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}>
                        {selectedCandidate.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Candidate Name</span>
                        <span className="text-sm font-semibold">{selectedCandidate.name}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                        <span className="text-sm font-medium">{selectedCandidate.email}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mobile Phone</span>
                        <span className="text-sm font-medium">{selectedCandidate.mobile}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">College / Institution</span>
                        <span className="text-sm font-medium">{selectedCandidate.college}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Registration ID</span>
                          <span className="text-sm font-medium">{selectedCandidate.registrationId || "N/A"}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Booking Reference</span>
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedCandidate.bookingId}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Interview Date</span>
                          <span className="text-xs font-semibold">{selectedCandidate.date}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Interview Time</span>
                          <span className="text-xs font-semibold text-indigo-500">{selectedCandidate.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Actions */}
                  <div className="p-6 border-t border-slate-200/50 dark:border-slate-800/40 space-y-3.5">
                    {selectedCandidate.status !== "Cancelled" && (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleMarkStatus(selectedCandidate.id, "Attended")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors min-h-[40px]"
                          >
                            Mark Attended
                          </button>
                          <button
                            onClick={() => handleMarkStatus(selectedCandidate.id, "Selected")}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors min-h-[40px]"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => handleMarkStatus(selectedCandidate.id, "Rejected")}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors min-h-[40px]"
                          >
                            Reject
                          </button>
                        </div>
                        <button
                          onClick={() => handleMailTrigger(selectedCandidate)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 text-xs shadow-md transition-all active:scale-[0.98] min-h-[48px]"
                        >
                          Send Meet Link (Email)
                        </button>
                        <button
                          onClick={() => handleCancelBooking(selectedCandidate.bookingId)}
                          className="w-full border border-rose-200 hover:bg-rose-500/10 text-rose-500 font-semibold py-2.5 rounded-xl text-xs transition-all min-h-[48px]"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM ALERTS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 bg-slate-900 text-white border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 text-xs.5 font-semibold"
          >
            <Activity className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

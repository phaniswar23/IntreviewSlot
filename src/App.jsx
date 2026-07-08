import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import LandingPage from "./pages/LandingPage";
import BookSlotPage from "./pages/BookSlotPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

// Route guard for Admin dashboard protection
function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? children : <Navigate to="/admin/login" replace />;
}

// Admin login route guard: redirect to dashboard if already logged in
function AdminLoginRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <Navigate to="/admin" replace /> : children;
}

export default function App() {
  // Initialize dark mode check on startup
  React.useEffect(() => {
    const root = window.document.documentElement;
    const theme = localStorage.getItem("theme") || "dark";
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/book" element={<BookSlotPage />} />
                <Route path="/confirmation" element={<ConfirmationPage />} />
                
                {/* Admin authentication and dashboard management */}
                <Route 
                  path="/admin/login" 
                  element={
                    <AdminLoginRoute>
                      <AdminLogin />
                    </AdminLoginRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

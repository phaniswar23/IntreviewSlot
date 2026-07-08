import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, isFirebaseConfigured, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock login state checking from sessionStorage
      const sessionUser = sessionStorage.getItem("nmx_admin_session");
      if (sessionUser) {
        setCurrentUser(JSON.parse(sessionUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    } else {
      // Mock auth validation
      const adminData = JSON.parse(localStorage.getItem("nmx_admin_user") || '{"email":"admin@neuromorphix.ai"}');
      // For convenience of local mock validation: allow "admin@neuromorphix.ai" / "admin112233"
      if (email === adminData.email && password === "admin112233") {
        const user = { email, uid: "mock_uid_admin" };
        sessionStorage.setItem("nmx_admin_session", JSON.stringify(user));
        setCurrentUser(user);
        return user;
      } else {
        const err = new Error("Invalid admin credentials. (Hint: Use admin@neuromorphix.ai / admin112233)");
        setError(err.message);
        throw err;
      }
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      sessionStorage.removeItem("nmx_admin_session");
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

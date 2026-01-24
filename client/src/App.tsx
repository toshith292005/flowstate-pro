import { Suspense, lazy, useEffect } from "react"; // 1. Added useEffect
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios"; // 2. Added axios

// 1. CRITICAL COMPONENTS
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// 2. LAZY LOAD PAGES
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

// --- NEW AUTH PAGES ---
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword")); 

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Settings = lazy(() => import("./pages/Settings"));

// 3. LOADING SCREEN
function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Loading FlowState...</p>
    </div>
  );
}

// 4. MAIN LAYOUT
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full font-sans text-white bg-black selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}

// 5. AUTHENTICATED LAYOUT
function AuthenticatedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}

function App() {
  // --- 6. CRITICAL SESSION SYNC LOGIC ---
  useEffect(() => {
    const syncUserSession = async () => {
      // Use dynamic URL (checks .env first, falls back to localhost)
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      try {
        // Ask backend: "Who is logged in?" via Cookie
        const res = await axios.get(`${API_URL}/api/current_user`, {
          withCredentials: true // IMPORTANT: Sends the HTTP-only cookie
        });

        if (res.data) {
          // If backend finds a user, save to localStorage so the app knows
          localStorage.setItem("flowstate_user", JSON.stringify(res.data));
          
          // Tell the UI (Navbar) to update immediately
          window.dispatchEvent(new Event("userUpdated"));
        }
      } catch (error) {
        // No session found - do nothing (user remains logged out)
      }
    };

    syncUserSession();
  }, []);
  // -------------------------------------

  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* NEW: Forgot Password Flow */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* --- PROTECTED ROUTES --- */}
            <Route path="/dashboard" element={<AuthenticatedPage><Dashboard /></AuthenticatedPage>} />
            <Route path="/analytics" element={<AuthenticatedPage><Analytics /></AuthenticatedPage>} />
            <Route path="/calendar" element={<AuthenticatedPage><Calendar /></AuthenticatedPage>} />
            <Route path="/settings" element={<AuthenticatedPage><Settings /></AuthenticatedPage>} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
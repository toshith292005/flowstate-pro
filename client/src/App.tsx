import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// 1. CRITICAL COMPONENTS (Load immediately)
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// 2. LAZY LOAD PAGES (Performance Optimization)
// This splits your bundle so the initial load is much faster on mobile networks.
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Settings = lazy(() => import("./pages/Settings"));

// 3. LOADING SCREEN
// Shows while the lazy pages are being fetched
function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Loading FlowState...</p>
    </div>
  );
}

// 4. MAIN LAYOUT WRAPPER
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    // OPTIMIZATION: min-h-[100dvh] fixes mobile browser address bar issues
    <div className="min-h-[100dvh] w-full font-sans text-white bg-black selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}

// 5. AUTHENTICATED LAYOUT (Reduces repetition)
// Wraps pages that need the Navbar
function AuthenticatedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar /> {/* Handles both Desktop Top-bar and Mobile Bottom-bar */}
      {children}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        {/* Suspense catches the lazy loading state */}
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* --- PROTECTED ROUTES --- */}
            <Route 
              path="/dashboard" 
              element={
                <AuthenticatedPage>
                  <Dashboard />
                </AuthenticatedPage>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <AuthenticatedPage>
                  <Analytics />
                </AuthenticatedPage>
              } 
            />

            <Route 
              path="/calendar" 
              element={
                <AuthenticatedPage>
                  <Calendar />
                </AuthenticatedPage>
              } 
            />

            <Route 
              path="/settings" 
              element={
                <AuthenticatedPage>
                  <Settings />
                </AuthenticatedPage>
              } 
            />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// 1. CRITICAL COMPONENTS
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// 2. LAZY LOAD PAGES
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
// ✅ NEW: Import the Success Page
const LoginSuccess = lazy(() => import("./pages/LoginSuccess")); 

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Settings = lazy(() => import("./pages/Settings"));
const Premium = lazy(() => import("./pages/Premium"));

// 3. LOADING SCREEN (Optimized for dark mode and mobile)
function LoadingScreen() {
  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-black text-white">
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

// 5. AUTHENTICATED LAYOUT WRAPPER
function AuthenticatedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* ✅ NEW: This MUST be public so the backend can redirect here */}
            <Route path="/login-success" element={<LoginSuccess />} />
            
            {/* --- PROTECTED ROUTES --- */}
            <Route path="/dashboard" element={<AuthenticatedPage><Dashboard /></AuthenticatedPage>} />
            <Route path="/analytics" element={<AuthenticatedPage><Analytics /></AuthenticatedPage>} />
            <Route path="/calendar" element={<AuthenticatedPage><Calendar /></AuthenticatedPage>} />
            <Route path="/settings" element={<AuthenticatedPage><Settings /></AuthenticatedPage>} />
            <Route path="/premium" element={<AuthenticatedPage><Premium /></AuthenticatedPage>} />
            
            {/* Catch-all: Safety redirect for invalid URLs */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
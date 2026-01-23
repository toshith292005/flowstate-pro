import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup"; 
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar"; 
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute"; // <--- 1. IMPORT THE BOUNCER

// Simple Layout Wrapper
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full font-sans text-white bg-black bg-grid">
      {children}
    </div>
  );
}

// Layouts for specific pages
function DashboardLayout() {
  return (
    <>
      <Navbar />
      <Dashboard />
    </>
  );
}

function AnalyticsLayout() {
  return (
    <>
      <Navbar />
      <Analytics />
    </>
  );
}

function CalendarLayout() {
  return (
    <>
      <Navbar />
      <Calendar />
    </>
  );
}

function SettingsLayout() {
  return (
    <>
      <Navbar />
      <Settings />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public Routes (Anyone can see these) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* PROTECTED ROUTES (The Bouncer guards these!) 
              If you aren't logged in, you can't see them.
          */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsLayout />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <CalendarLayout />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <VercelAnalytics />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
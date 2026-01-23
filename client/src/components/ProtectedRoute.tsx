import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Check if the digital ID card exists in browser storage
  const token = localStorage.getItem("flowstate_token");

  // If no token, kick them to Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, let them pass
  return <>{children}</>;
}
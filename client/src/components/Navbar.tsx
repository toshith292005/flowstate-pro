import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, BarChart3, Calendar, Settings, LogOut, Zap } from "lucide-react";
import axios from "axios"; // 1. Added Axios Import

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("flowstate_user");
    return saved ? JSON.parse(saved) : { name: "Guest", photo: null };
  });

  useEffect(() => {
    const handleUserUpdate = () => {
      const saved = localStorage.getItem("flowstate_user");
      if (saved) setUser(JSON.parse(saved));
    };
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // 2. Updated Logout Logic to kill Backend Session
  const handleLogout = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      // Tell backend to delete the httpOnly cookie
      await axios.get(`${API_URL}/api/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear Frontend
    localStorage.removeItem("flowstate_token");
    localStorage.removeItem("flowstate_user");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/dashboard", icon: <LayoutGrid size={24} /> },
    { name: "Calendar", path: "/calendar", icon: <Calendar size={24} /> },
    { name: "Insights", path: "/analytics", icon: <BarChart3 size={24} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={24} /> },
  ];

  return (
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="h-16 md:h-20 border-b border-white/10 bg-black/80 backdrop-blur-xl px-4 md:px-10 flex items-center justify-between sticky top-0 z-50 transition-all">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:scale-105 transition-transform">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-xl md:text-2xl font-black text-white tracking-tight">FlowState</span>
          </Link>
        </div>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 p-1.5 rounded-full backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                  ${isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {/* Scale down icon slightly for desktop text labels */}
                <span className="scale-75">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 md:pl-6">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold overflow-hidden shadow-inner">
               {user.photo ? (
                 <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 getInitials(user.name || "Guest")
               )}
            </div>
            
            {/* UPDATED: Only shows name now */}
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-white">{user.name}</p>
            </div>

            {/* Desktop Logout Button */}
            <button 
              onClick={handleLogout} 
              className="hidden md:flex p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
               <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      {/* Fixed to bottom, hidden on MD screens and up */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-90 ${
                  isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {/* Icon Container with subtle glow if active */}
                <div className={`relative ${isActive ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : ""}`}>
                    {link.icon}
                    {isActive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-white" : "text-slate-500"}`}>
                    {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
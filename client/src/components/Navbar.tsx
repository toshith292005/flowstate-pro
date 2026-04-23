import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, BarChart3, Calendar, Settings, LogOut, Zap, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("flowstate_user");
    // Default to Guest if no user is found
    return saved ? JSON.parse(saved) : { name: "Guest", photo: null };
  });

  useEffect(() => {
    const handleUserUpdate = () => {
      const saved = localStorage.getItem("flowstate_user");
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        setUser({ name: "Guest", photo: null });
      }
    };
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // ✅ SIMPLIFIED LOGOUT: Just clear the local data
  const handleLogout = () => {
    // 1. Clear the local storage
    localStorage.removeItem("flowstate_token");
    localStorage.removeItem("flowstate_user");
    
    // 2. Notify other components (like this Navbar) to reset state
    window.dispatchEvent(new Event("userUpdated"));
    
    // 3. Send user back to the home page or login
    navigate("/");
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
      <nav className="h-16 md:h-20 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-4 md:px-10 flex items-center justify-between sticky top-0 z-50 transition-all">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:scale-105 transition-transform">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">FlowState</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-1.5 rounded-full backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                  ${isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105" 
                    : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/5"
                  }
                `}
              >
                <span className="scale-75">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Profile, Theme Toggle & Logout */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 p-2 md:px-3 md:py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all active:scale-95 group"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={18} className="animate-pulse" /> : <Moon size={18} />}
            <span className="hidden lg:block text-xs font-bold uppercase tracking-wider">Theme</span>
          </button>

          {!user.isPremium ? (
            <Link 
              to="/premium" 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            >
              <Zap size={16} className="fill-white" /> <span className="hidden lg:block">Upgrade to Pro</span>
              <span className="block lg:hidden">Pro</span>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl">
              <Zap size={16} className="fill-emerald-400" /> <span className="hidden lg:block">Pro Active</span>
            </div>
          )}
          
          <div className={`flex items-center gap-3 md:pl-4 border-l border-slate-200 dark:border-white/10`}>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-indigo-900/50 border border-slate-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold overflow-hidden shadow-inner shrink-0">
               {user.photo ? (
                 <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 getInitials(user.name || "Guest")
               )}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="hidden md:flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
               <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-90 ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <div className={`relative ${isActive ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : ""}`}>
                    {link.icon}
                    {isActive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>}
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
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
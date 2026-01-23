import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, BarChart3, Calendar, Settings, LogOut } from "lucide-react";

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

  const handleLogout = () => {
    localStorage.removeItem("flowstate_token");
    localStorage.removeItem("flowstate_user");
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
    { name: "Calendar", path: "/calendar", icon: <Calendar size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-xl px-6 md:px-10 flex items-center justify-between sticky top-0 z-50">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl md:text-2xl font-black text-white tracking-tight">FlowState</span>
          </Link>
        </div>

        {/* Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-full">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                  ${isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 md:pl-4 md:border-l border-white/10">
            <div className="w-9 h-9 md:w-10 h-10 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold overflow-hidden">
               {user.photo ? (
                 <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 getInitials(user.name || "Guest")
               )}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-white leading-none">{user.name}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
               <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      {/* This only shows on screens smaller than 'md' (768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10 px-6 py-3">
        <div className="flex items-center justify-between">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-indigo-400" : "text-slate-500"
                }`}
              >
                {link.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
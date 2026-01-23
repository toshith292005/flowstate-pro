import { useState, useEffect } from "react";
import { User, Bell, Shield, Trash2, LogOut, Edit2, Check, X, Link as LinkIcon, Loader2, Camera } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // PROFILE STATE
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("flowstate_user");
    return saved ? JSON.parse(saved) : { name: "", email: "", photo: "" };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempPhoto, setTempPhoto] = useState(user.photo);

  // SETTINGS STATE
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("flowstate_settings");
    return saved ? JSON.parse(saved) : { taskReminders: true, weeklySummary: false };
  });

  useEffect(() => {
    localStorage.setItem("flowstate_settings", JSON.stringify(settings));
  }, [settings]);

  // --- HANDLERS ---
  const handleSaveProfile = async () => {
    if (!tempName.trim()) return;
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("flowstate_user") || "{}");
      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, {
        id: storedUser.id || storedUser._id, 
        name: tempName,
        email: user.email, 
        photo: tempPhoto 
      });
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem("flowstate_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated")); 
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!user.email) return;
    if (confirm("⚠️ ARE YOU SURE? This will PERMANENTLY delete all your data.")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/tasks`, { params: { email: user.email } });
        localStorage.clear();
        window.location.href = "/login";
      } catch (err) {
        alert("Failed to delete data.");
      }
    }
  };

  const handleCancelEdit = () => {
    setTempName(user.name);
    setTempPhoto(user.photo);
    setIsEditing(false);
  };

  const handleDeletePhoto = () => {
    if (confirm("Remove profile picture?")) setTempPhoto(""); 
  };

  const toggleNotification = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("flowstate_token");
    localStorage.removeItem("flowstate_user");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* 1. BACKGROUND AMBIENCE (Copied from Dashboard) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]"></div>
         <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-10 max-w-4xl mx-auto pb-24 space-y-6 md:space-y-8">
        
        {/* HEADER */}
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        {/* ACCOUNT CARD */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-8 relative overflow-hidden transition-all duration-300 backdrop-blur-md">
            <div className="flex justify-between items-start mb-6 relative z-10">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <User size={20} className="text-indigo-400" /> Account
                </h2>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors active:scale-95">
                    <Edit2 size={18} />
                    </button>
                ) : (
                    <div className="flex gap-2">
                    <button onClick={handleCancelEdit} disabled={loading} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-50 active:scale-95">
                        <X size={18} />
                    </button>
                    <button onClick={handleSaveProfile} disabled={loading} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg disabled:opacity-50 active:scale-95">
                        {loading ? <Loader2 size={18} className="animate-spin"/> : <Check size={18} />}
                    </button>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-2 relative z-10">
                <div className="relative group shrink-0">
                    <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-black/50 shadow-xl overflow-hidden relative">
                    {(isEditing ? tempPhoto : user.photo) ? (
                        <img src={(isEditing ? tempPhoto : user.photo) as string} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        getInitials(isEditing ? tempName : user.name)
                    )}
                    </div>
                    {isEditing && (
                        <div className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-2 border-black text-white shadow-lg">
                            <Camera size={14} />
                        </div>
                    )}
                </div>
                
                <div className="text-center md:text-left flex-1 w-full">
                    {isEditing ? (
                    <div className="space-y-4 w-full max-w-md mx-auto md:mx-0">
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 uppercase block mb-1">Display Name</label>
                            <input 
                                type="text" 
                                value={tempName} 
                                onChange={(e) => setTempName(e.target.value)} 
                                placeholder="Your Name" 
                                className="block w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all text-base" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 uppercase block mb-1">Profile Image URL</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input 
                                        type="text" 
                                        value={tempPhoto} 
                                        onChange={(e) => setTempPhoto(e.target.value)} 
                                        placeholder="https://..." 
                                        className="block w-full bg-black/40 border border-white/20 rounded-xl pl-10 pr-3 py-3 text-slate-300 text-base focus:outline-none focus:border-indigo-500 transition-all" 
                                    />
                                </div>
                                {tempPhoto && (
                                    <button onClick={handleDeletePhoto} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors active:scale-95 shrink-0">
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    ) : (
                    <div className="space-y-1">
                        <h3 className="text-2xl md:text-3xl font-bold text-white">{user.name || "Guest User"}</h3>
                        <p className="text-slate-400 text-sm md:text-base break-all">{user.email || "No email linked"}</p>
                    </div>
                    )}
                </div>
            </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-8 backdrop-blur-md">
            <h2 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell size={20} className="text-indigo-400" /> Notifications
            </h2>
            <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 hover:bg-black/40 transition-colors cursor-pointer active:scale-[0.99]" onClick={() => toggleNotification('taskReminders')}>
                <div className="pr-4">
                <p className="text-white font-medium text-sm md:text-base">Task Reminders</p>
                <p className="text-xs md:text-sm text-slate-500">Get notified 1 hour before due date</p>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${settings.taskReminders ? "bg-indigo-600" : "bg-slate-700"}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${settings.taskReminders ? "right-1" : "left-1"}`}></div>
                </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 hover:bg-black/40 transition-colors cursor-pointer active:scale-[0.99]" onClick={() => toggleNotification('weeklySummary')}>
                <div className="pr-4">
                <p className="text-white font-medium text-sm md:text-base">Weekly Summary</p>
                <p className="text-xs md:text-sm text-slate-500">Receive a weekly productivity report</p>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${settings.weeklySummary ? "bg-indigo-600" : "bg-slate-700"}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${settings.weeklySummary ? "right-1" : "left-1"}`}></div>
                </div>
            </div>
            </div>
        </section>

        {/* DANGER ZONE */}
        <section className="border border-red-500/20 bg-red-500/5 rounded-3xl p-5 md:p-8 backdrop-blur-md">
            <h2 className="text-lg md:text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
            <Shield size={20} /> Danger Zone
            </h2>
            
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-white font-medium text-sm md:text-base">Clear All Data</p>
                        <p className="text-xs md:text-sm text-slate-500">Permanently delete all tasks and local history.</p>
                    </div>
                    <button onClick={handleResetData} className="w-full md:w-auto px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 active:scale-95">
                        <Trash2 size={18} /> Reset Data
                    </button>
                </div>

                <div className="h-px bg-red-500/10 w-full my-2"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-white font-medium text-sm md:text-base">Sign Out</p>
                        <p className="text-xs md:text-sm text-slate-500">Log out of your account on this device.</p>
                    </div>
                    <button onClick={handleLogout} className="w-full md:w-auto px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 active:scale-95">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}
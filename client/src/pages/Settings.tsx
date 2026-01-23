import { useState, useEffect } from "react";
import { User, Bell, Shield, Trash2, LogOut, Edit2, Check, X, Link as LinkIcon, Loader2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 1. DYNAMIC API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // PROFILE STATE
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("flowstate_user");
    return saved ? JSON.parse(saved) : { 
      name: "", 
      email: "",
      photo: "" 
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempPhoto, setTempPhoto] = useState(user.photo);

  // SETTINGS STATE
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("flowstate_settings");
    return saved ? JSON.parse(saved) : { 
      taskReminders: true, 
      weeklySummary: false,
    };
  });

  // AUTO-SAVE SETTINGS
  useEffect(() => {
    localStorage.setItem("flowstate_settings", JSON.stringify(settings));
  }, [settings]);

  // --- HANDLERS ---

  const handleSaveProfile = async () => {
    if (!tempName.trim()) return;
    setLoading(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("flowstate_user") || "{}");
      
      // UPDATED: Use dynamic URL
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
      alert("Failed to save profile. Check your internet connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!user.email) return;

    if (confirm("⚠️ ARE YOU SURE? \n\nThis will PERMANENTLY delete all your tasks from the database. This action cannot be undone.")) {
      try {
        // UPDATED: Use dynamic URL for deleting tasks
        await axios.delete(`${API_BASE_URL}/api/tasks`, {
          params: { email: user.email }
        });

        localStorage.clear();
        window.location.href = "/login";
        
      } catch (err) {
        alert("Failed to delete data. Check server connection.");
        console.error(err);
      }
    }
  };

  const handleCancelEdit = () => {
    setTempName(user.name);
    setTempPhoto(user.photo);
    setIsEditing(false);
  };

  const handleDeletePhoto = () => {
    if (confirm("Remove profile picture?")) {
      setTempPhoto(""); 
    }
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
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-20 space-y-8 bg-black">
      
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      {/* ACCOUNT & PHOTO */}
      <section className="bg-black border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User size={20} className="text-indigo-400" /> Account
          </h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors">
              <Edit2 size={16} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleCancelEdit} disabled={loading} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-50"><X size={16} /></button>
              <button onClick={handleSaveProfile} disabled={loading} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Check size={16} />}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 relative z-10">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-black shadow-xl overflow-hidden relative">
              {(isEditing ? tempPhoto : user.photo) ? (
                <img src={(isEditing ? tempPhoto : user.photo) as string} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(isEditing ? tempName : user.name)
              )}
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1 w-full">
            {isEditing ? (
              <div className="space-y-3 w-full max-w-md">
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Display Name</label>
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Your Name" className="block w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Profile Image URL</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input type="text" value={tempPhoto} onChange={(e) => setTempPhoto(e.target.value)} placeholder="https://example.com/me.jpg" className="block w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                        </div>
                        {tempPhoto && (
                            <button 
                                onClick={handleDeletePhoto} 
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors"
                                title="Remove Picture"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                  </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white">{user.name || "Guest User"}</h3>
                <p className="text-slate-400">{user.email || "No email linked"}</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="bg-black border border-white/10 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Bell size={20} className="text-indigo-400" /> Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleNotification('taskReminders')}>
            <div>
              <p className="text-white font-medium">Task Reminders</p>
              <p className="text-sm text-slate-500">Get notified 1 hour before due date</p>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors ${settings.taskReminders ? "bg-indigo-600" : "bg-slate-700"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.taskReminders ? "right-1" : "left-1"}`}></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleNotification('weeklySummary')}>
            <div>
              <p className="text-white font-medium">Weekly Summary</p>
              <p className="text-sm text-slate-500">Receive a weekly productivity report</p>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors ${settings.weeklySummary ? "bg-indigo-600" : "bg-slate-700"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.weeklySummary ? "right-1" : "left-1"}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="border border-red-500/20 bg-red-500/5 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
          <Shield size={20} /> Danger Zone
        </h2>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white font-medium">Clear All Data</p>
            <p className="text-sm text-slate-500">Permanently delete all tasks and local history.</p>
          </div>
          <button onClick={handleResetData} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
            <Trash2 size={16} /> Reset Data
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-red-500/10 pt-6">
          <div>
            <p className="text-white font-medium">Sign Out</p>
            <p className="text-sm text-slate-500">Log out of your account on this device.</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </section>

    </div>
  );
}
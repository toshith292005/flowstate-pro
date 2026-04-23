import { useState, useEffect, useRef } from "react";
import { User, Bell, Shield, Trash2, LogOut, Edit2, Check, X, Loader2, Camera, Zap, Smartphone, Lock } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // MFA STATE
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [mfaOtp, setMfaOtp] = useState("");
  const [mfaStep, setMfaStep] = useState<"idle" | "sent" | "done">(user.mfaEnabled ? "done" : "idle");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaMsg, setMfaMsg] = useState("");

  // CHANGE PASSWORD STATE
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
        photo: tempPhoto // This will be the base64 string if a new file was selected
      });
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem("flowstate_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated")); 
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save profile. Please try again.");
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
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = () => {
    if (confirm("Remove profile picture?")) {
        setTempPhoto("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!pwCurrent || !pwNew || !pwConfirm) {
      return setPwMsg({ text: "All fields are required.", type: "error" });
    }
    if (pwNew !== pwConfirm) {
      return setPwMsg({ text: "New passwords do not match.", type: "error" });
    }
    if (pwNew.length < 8) {
      return setPwMsg({ text: "New password must be at least 8 characters.", type: "error" });
    }
    setPwLoading(true);
    try {
      const token = localStorage.getItem("flowstate_token");
      await axios.post(`${API_BASE_URL}/api/user/password`, { currentPassword: pwCurrent, newPassword: pwNew }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPwMsg({ text: "Password updated successfully!", type: "success" });
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch (err: any) {
      setPwMsg({ text: err.response?.data?.message || "Failed to update password.", type: "error" });
    } finally {
      setPwLoading(false);
    }
  };

  // HANDLE FILE SELECTION FROM GALLERY/EXPLORER
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // TRIGGER FILE INPUT CLICK
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden transition-colors duration-300">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 dark:bg-indigo-900/10 blur-[120px]"></div>
         <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/5 dark:bg-emerald-900/10 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-10 max-w-4xl mx-auto pb-24 space-y-6 md:space-y-8">
        
        {/* HEADER */}
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        </div>

        {/* ACCOUNT CARD */}
        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-8 relative overflow-hidden transition-all duration-300 backdrop-blur-md shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-6 relative z-10">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User size={20} className="text-indigo-600 dark:text-indigo-400" /> Account
                </h2>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg transition-colors active:scale-95">
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
                    <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-black/50 shadow-xl overflow-hidden relative">
                    {(isEditing ? tempPhoto : user.photo) ? (
                        <img src={(isEditing ? tempPhoto : user.photo) as string} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        getInitials(isEditing ? tempName : user.name)
                    )}
                    </div>
                    
                    {/* CAMERA BUTTON TO UPLOAD FROM GALLERY */}
                    {isEditing && (
                        <>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            <button 
                                onClick={handleUploadClick} 
                                className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-2 border-white dark:border-black text-white shadow-lg hover:bg-indigo-500 transition-colors active:scale-95"
                                title="Upload from Gallery"
                            >
                                <Camera size={14} />
                            </button>
                        </>
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
                                className="block w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500 transition-all text-base" 
                            />
                        </div>
                        {/* URL INPUT REMOVED - Only Gallery Upload is used now */}
                        {tempPhoto && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase block mb-1">Profile Picture</label>
                                <div className="flex items-center justify-between bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300">
                                    <span className="text-sm truncate">Image Selected</span>
                                    <button onClick={handleDeletePhoto} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-500 border border-red-500/20 rounded-lg transition-colors active:scale-95 shrink-0">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    ) : (
                     <div className="space-y-1">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{user.name || "Guest User"}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base break-all">{user.email || "No email linked"}</p>
                     </div>
                    )}
                </div>
            </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-8 backdrop-blur-md shadow-sm dark:shadow-none">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell size={20} className="text-indigo-600 dark:text-indigo-400" /> Notifications
            </h2>
            <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-black/40 transition-colors cursor-pointer active:scale-[0.99]" onClick={() => toggleNotification('taskReminders')}>
                <div className="pr-4">
                <p className="text-slate-900 dark:text-white font-medium text-sm md:text-base">Task Reminders</p>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500">Get notified 1 hour before due date</p>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${settings.taskReminders ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${settings.taskReminders ? "right-1" : "left-1"}`}></div>
                </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-black/40 transition-colors cursor-pointer active:scale-[0.99]" onClick={() => toggleNotification('weeklySummary')}>
                <div className="pr-4">
                <p className="text-slate-900 dark:text-white font-medium text-sm md:text-base">Weekly Summary</p>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500">Receive a weekly productivity report</p>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${settings.weeklySummary ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${settings.weeklySummary ? "right-1" : "left-1"}`}></div>
                </div>
            </div>
            </div>
        </section>

        {/* SECURITY / MFA */}
        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-8 backdrop-blur-md shadow-sm dark:shadow-none">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Lock size={20} className="text-indigo-600 dark:text-indigo-400" /> Two-Factor Authentication
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Add your mobile number to receive a one-time SMS code each time you log in.
            </p>

            {mfaStep === "done" ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl">
                        <Smartphone size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-sm">2FA Active</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">{user.phoneNumber || phoneNumber}</p>
                        </div>
                        <div className="ml-auto">
                            <Check size={18} className="text-emerald-400" />
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            const token = localStorage.getItem("flowstate_token");
                            await axios.post(`${API_BASE_URL}/api/auth/mfa/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
                            const updatedUser = { ...user, mfaEnabled: false };
                            setUser(updatedUser);
                            localStorage.setItem("flowstate_user", JSON.stringify(updatedUser));
                            setMfaStep("idle");
                            setMfaMsg("2FA has been disabled.");
                        }}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold transition-colors"
                    >
                        Disable 2FA
                    </button>
                </div>
            ) : mfaStep === "idle" ? (
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <input
                            type="tel"
                            placeholder="+91XXXXXXXXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm"
                        />
                        <button
                            disabled={mfaLoading || !phoneNumber}
                            onClick={async () => {
                                setMfaLoading(true); setMfaMsg("");
                                try {
                                    const token = localStorage.getItem("flowstate_token");
                                    await axios.post(`${API_BASE_URL}/api/auth/mfa/setup-phone`, { phoneNumber }, { headers: { Authorization: `Bearer ${token}` } });
                                    setMfaStep("sent");
                                    setMfaMsg("OTP sent! Check your phone.");
                                } catch (err: any) {
                                    setMfaMsg(err.response?.data?.message || "Failed to send OTP.");
                                } finally { setMfaLoading(false); }
                            }}
                            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {mfaLoading ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />} Send OTP
                        </button>
                    </div>
                    {mfaMsg && <p className="text-sm text-red-400">{mfaMsg}</p>}
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-emerald-400 text-sm font-medium">{mfaMsg}</p>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={mfaOtp}
                            maxLength={6}
                            onChange={(e) => setMfaOtp(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm tracking-widest font-mono"
                        />
                        <button
                            disabled={mfaLoading || mfaOtp.length !== 6}
                            onClick={async () => {
                                setMfaLoading(true); setMfaMsg("");
                                try {
                                    const token = localStorage.getItem("flowstate_token");
                                    const res = await axios.post(`${API_BASE_URL}/api/auth/mfa/confirm-phone`, { otp: mfaOtp }, { headers: { Authorization: `Bearer ${token}` } });
                                    const updatedUser = { ...user, mfaEnabled: true, phoneNumber: res.data.phoneNumber };
                                    setUser(updatedUser);
                                    localStorage.setItem("flowstate_user", JSON.stringify(updatedUser));
                                    setMfaStep("done");
                                    setMfaMsg("2FA enabled successfully!");
                                } catch (err: any) {
                                    setMfaMsg(err.response?.data?.message || "Invalid OTP.");
                                } finally { setMfaLoading(false); }
                            }}
                            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {mfaLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Verify
                        </button>
                    </div>
                    <button onClick={() => { setMfaStep("idle"); setMfaMsg(""); }} className="text-xs text-slate-500 hover:text-slate-300 underline">
                        Use a different number
                    </button>
                </div>
            )}
        </section>

        {/* CHANGE PASSWORD */}
        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-8 backdrop-blur-md shadow-sm dark:shadow-none">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Lock size={20} className="text-indigo-600 dark:text-indigo-400" /> Change Password
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Update your login password. Must be at least 8 characters.</p>
            <div className="space-y-3 max-w-md">
                <input
                    type="password"
                    placeholder="Current Password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                />
                {pwMsg && (
                    <p className={`text-sm font-medium ${pwMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                        {pwMsg.text}
                    </p>
                )}
                <button
                    onClick={handleChangePassword}
                    disabled={pwLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 active:scale-95"
                >
                    {pwLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Update Password
                </button>
            </div>
        </section>

        {/* SUBSCRIPTION & BILLING */}
        <section className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-5 md:p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <Zap size={100} className="text-white dark:text-indigo-300" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                <Zap size={20} className="text-white dark:text-indigo-400 fill-white dark:fill-indigo-400" /> Subscription & Billing
            </h2>
            <p className="text-slate-300 text-sm md:text-base mb-6 relative z-10">
                {user.isPremium 
                    ? "You are currently on the FlowState Pro plan. Enjoy unlimited tasks and advanced analytics!" 
                    : "Upgrade to FlowState Pro for unlimited tasks, premium themes, and priority support."}
            </p>
            
            <div className="relative z-10">
                {user.isPremium ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-emerald-500/20 text-white dark:text-emerald-400 border border-white/30 dark:border-emerald-500/30 rounded-xl font-bold text-sm">
                        <Check size={18} /> Pro Active
                    </div>
                ) : (
                    <button 
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const token = localStorage.getItem("flowstate_token");
                                const res = await axios.post(`${API_BASE_URL}/api/payment/create-subscription`, {}, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                const order = res.data; // Fixed: res.data IS the order

                                const options = {
                                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy",
                                    amount: order.amount,
                                    currency: "INR",
                                    name: "FlowState Pro",
                                    description: "1-Year Premium Subscription",
                                    order_id: order.id,
                                    handler: async function (response: any) {
                                        try {
                                            const verifyRes = await axios.post(`${API_BASE_URL}/api/payment/verify`, response, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            if (verifyRes.status === 200) {
                                                const updatedUser = { ...user, isPremium: true };
                                                setUser(updatedUser);
                                                localStorage.setItem("flowstate_user", JSON.stringify(updatedUser));
                                                alert("Successfully upgraded to Pro!");
                                            }
                                        } catch (err) {
                                            alert("Payment verification failed.");
                                        }
                                    },
                                    prefill: {
                                        name: user.name,
                                        email: user.email,
                                    },
                                    theme: {
                                        color: "#4f46e5"
                                    }
                                };
                                const rzp = new (window as any).Razorpay(options);
                                rzp.open();
                            } catch (err) {
                                console.error(err);
                                alert("Failed to initiate payment. Please try again.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin"/> : <Zap size={18} className="fill-white"/>} 
                        Upgrade to Pro (₹999/yr)
                    </button>
                )}
            </div>
        </section>

        {/* DANGER ZONE */}
        <section className="border border-red-500/20 bg-red-50 dark:bg-red-500/5 rounded-3xl p-5 md:p-8 backdrop-blur-md shadow-sm dark:shadow-none">
            <h2 className="text-lg md:text-xl font-bold text-red-600 dark:text-red-500 mb-6 flex items-center gap-2">
            <Shield size={20} /> Danger Zone
            </h2>
            
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-slate-900 dark:text-white font-medium text-sm md:text-base">Clear All Data</p>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500">Permanently delete all tasks and local history.</p>
                    </div>
                    <button onClick={handleResetData} className="w-full md:w-auto px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 active:scale-95">
                        <Trash2 size={18} /> Reset Data
                    </button>
                </div>

                <div className="h-px bg-red-500/10 w-full my-2"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-slate-900 dark:text-white font-medium text-sm md:text-base">Sign Out</p>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500">Log out of your account on this device.</p>
                    </div>
                    <button onClick={handleLogout} className="w-full md:w-auto px-4 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 active:scale-95">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}
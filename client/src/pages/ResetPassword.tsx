import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Zap, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
        setStatus("error");
        setMessage("Passwords do not match.");
        return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      // Sends the Token (from URL) and New Password to backend
      await axios.post(`${API_BASE_URL}/api/auth/reset-password/${token}`, { password });
      setStatus("success");
      setMessage("Your password has been successfully reset.");
      
      // Auto-redirect
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full font-sans selection:bg-indigo-500 selection:text-white flex items-center justify-center p-4 relative bg-slate-50 dark:bg-black overflow-hidden transition-colors duration-300">
      
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 dark:bg-indigo-900/20 blur-[120px]"></div>
         <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/5 dark:bg-emerald-900/10 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl p-8 border border-slate-200 dark:border-white/10 relative z-10">
        
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
                <Zap size={24} className="text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Set New Password</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Create a secure password for your account</p>
        </div>

        {status === "success" ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-emerald-600 dark:text-emerald-400 font-bold mb-1">Password Reset!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{message}</p>
            <Link to="/login" className="text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 rounded-xl transition-colors inline-block w-full">
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {status === "error" && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {message}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">New Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            placeholder="Min 6 characters"
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white p-2"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">Confirm Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            placeholder="Re-enter password"
                            required
                        />
                    </div>
                </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-2">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
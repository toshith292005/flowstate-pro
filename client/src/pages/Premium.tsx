import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Check, Star, Shield, BarChart3, Infinity, Headphones, ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const features = [
  { icon: <Infinity size={20} />, label: "Unlimited Tasks & Projects" },
  { icon: <BarChart3 size={20} />, label: "Advanced Analytics & Insights" },
  { icon: <Star size={20} />, label: "Premium Themes & UI Customization" },
  { icon: <Shield size={20} />, label: "Priority Security & MFA" },
  { icon: <Headphones size={20} />, label: "Priority Customer Support" },
  { icon: <Zap size={20} />, label: "Early Access to New Features" },
];

export default function Premium() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const user = (() => {
    const saved = localStorage.getItem("flowstate_user");
    return saved ? JSON.parse(saved) : { name: "", email: "", isPremium: false };
  })();

  const handleUpgrade = async () => {
    if (user.isPremium) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("flowstate_token");
      const res = await axios.post(`${API_BASE_URL}/api/payment/create-subscription`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: order.amount,
        currency: "INR",
        name: "FlowState Pro",
        description: "1-Year Premium Subscription",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await axios.post(`${API_BASE_URL}/api/payment/verify`, response, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (verifyRes.status === 200) {
              const updated = { ...user, isPremium: true };
              localStorage.setItem("flowstate_user", JSON.stringify(updated));
              window.dispatchEvent(new Event("userUpdated"));
              navigate("/dashboard");
            }
          } catch {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#4f46e5" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-900/20 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-[30%] left-[-5%] w-[30%] h-[30%] rounded-full bg-violet-800/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* HEADER */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-bold mb-6">
            <Zap size={14} className="fill-indigo-400" /> Limited Time Offer
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Unlock{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              FlowState Pro
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Take your productivity to the next level. Everything you need, unlimited.
          </p>
        </div>

        {/* PRICING CARD */}
        <div className="relative bg-gradient-to-b from-indigo-900/30 to-purple-900/20 border border-indigo-500/30 rounded-3xl p-8 md:p-12 backdrop-blur-md overflow-hidden mb-8">
          {/* Glow orb inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">

            {/* FEATURES LIST */}
            <div className="flex-1 w-full">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6">Everything Included</p>
              <ul className="space-y-4">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                      {f.icon}
                    </div>
                    <span className="text-white font-medium text-sm md:text-base">{f.label}</span>
                    <Check size={16} className="ml-auto text-emerald-400 shrink-0" />
                  </li>
                ))}
              </ul>
            </div>

            {/* PRICE BOX */}
            <div className="w-full md:w-72 shrink-0 flex flex-col items-center text-center bg-black/30 border border-white/10 rounded-2xl p-8">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Annual Plan</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black text-white">₹999</span>
                <span className="text-slate-400 text-lg mb-2">/yr</span>
              </div>
              <p className="text-emerald-400 text-sm font-bold mb-8">
                That's just ₹83/month
              </p>

              {user.isPremium ? (
                <div className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold text-sm">
                  <Check size={18} /> Pro Already Active
                </div>
              ) : (
                <button
                  id="upgrade-to-pro-btn"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3 text-base"
                >
                  {loading ? (
                    <><Loader2 size={20} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Zap size={20} className="fill-white" /> Upgrade Now</>
                  )}
                </button>
              )}

              <p className="text-slate-600 text-xs mt-4">Secured by Razorpay · Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-500" /> 256-bit Encryption</span>
          <span className="flex items-center gap-1.5"><Check size={14} className="text-indigo-400" /> 30-Day Money Back</span>
          <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500" /> Trusted by 10,000+ users</span>
        </div>
      </div>
    </div>
  );
}

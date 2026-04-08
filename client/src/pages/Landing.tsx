import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    // OPTIMIZATION: min-h-[100dvh] handles mobile browser bars perfectly
    <div className="font-sans selection:bg-indigo-500 selection:text-white min-h-[100dvh] flex flex-col relative bg-black overflow-x-hidden">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
         <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/20 blur-[120px]"></div>
         {/* Noise Texture for premium feel */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* 2. NAVBAR */}
      <header className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 bg-transparent">
        {/* Logo */}
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Zap size={20} fill="white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FlowState</span>
        </div>

        {/* Login Button - Blurry background for readability over gradients */}
        <Link to="/login" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white transition-all backdrop-blur-md active:scale-95">
            Sign In
        </Link>
      </header>

      {/* 3. HERO SECTION */}
      {/* OPTIMIZATION: pt-28 for mobile (less gap), pt-32 for desktop */}
      <main className="flex-1 flex items-center justify-center pt-28 pb-12 px-4 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 w-full">
        
          {/* Left: Text Content */}
          <div className="flex-1 space-y-8 relative text-center lg:text-left">
            
            {/* Badge - Smaller text on mobile */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-base font-bold bg-white/5 text-indigo-300 border border-white/10 shadow-lg backdrop-blur-sm cursor-default">
              <span className="flex h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Your Productivity Companion</span>
            </div>
            
            {/* Heading - Scales from 4xl to 7xl */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-white">
              Master Your Tasks, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x bg-[length:200%_auto]">
                Enter FlowState
              </span>
            </h1>
            
            <p className="text-base md:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium text-slate-400 px-2 md:px-0">
              The ultimate to-do app with smart organization, powerful analytics, and seamless recurring tasks.
            </p>
            
            {/* CTA Button - Full width on mobile for easier tapping */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95">
                Get Started Free <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          {/* OPTIMIZATION: max-w-md on mobile prevents image from being too tall */}
          <div className="flex-1 relative w-full max-w-md lg:max-w-none aspect-square lg:h-[500px] mt-8 lg:mt-0">
             {/* Glowing backing */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] blur-xl opacity-40 animate-pulse"></div>
            
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black/80 backdrop-blur-sm group">
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
                  alt="Modern Dark Workspace" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
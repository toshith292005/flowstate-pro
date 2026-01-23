import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="font-sans selection:bg-indigo-500 selection:text-white min-h-screen flex flex-col relative bg-grid">
      
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
         <div className="absolute top-[40%] right-[0%] w-[40%] h-[40%] rounded-full bg-violet-900/20 blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <header className="absolute top-0 w-full z-50 flex items-center justify-end px-6 py-6 md:px-12 bg-transparent border-none">
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 w-full">
        
          {/* Left: Text Content */}
          <div className="flex-1 space-y-8 relative">
            {/* UPDATED: Made larger (text-base, px-6, larger dot) */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-base font-bold bg-white/5 text-indigo-300 border border-white/10 shadow-lg backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
              <span className="flex h-3 w-3 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Your Productivity Companion</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-white">
              Master Your Tasks, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
                Enter FlowState
              </span>
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed max-w-lg font-medium text-slate-400">
              The ultimate to-do app with smart organization, powerful analytics, and seamless recurring tasks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/login" className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-2xl animate-pulse-glow">
                Get Started Free <ArrowRight size={22} />
              </Link>
            </div>
          </div>

          {/* Right: Image - FLOATING ANIMATION */}
          <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[500px] animate-float">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-30"></div>
            
            <img 
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop" 
              alt="Computer Workspace" 
              className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl border border-white/20 bg-black transform transition-transform hover:scale-[1.02] duration-500"
            />
          </div>

        </div>
      </main>
    </div>
  );
}
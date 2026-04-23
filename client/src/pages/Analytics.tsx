import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip 
} from 'recharts';
import { CheckCircle2, Circle, Clock, Activity } from "lucide-react";
import { useEffect, useState, useMemo } from 'react';
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("flowstate_user") || "{}");
    const userEmail = user.email;

    const fetchTasks = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/tasks`, {
            params: { email: userEmail }
        });
        setProjects(res.data);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const trendData = useMemo(() => {
    const days = [];
    const getLocalYYYYMMDD = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };

    const isSameCalendarDay = (localDate: Date, isoString: string) => {
        if (!isoString) return false;
        const targetDate = new Date(isoString); 
        return localDate.getDate() === targetDate.getDate() &&
               localDate.getMonth() === targetDate.getMonth() &&
               localDate.getFullYear() === targetDate.getFullYear();
    };

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const localDateStr = getLocalYYYYMMDD(d); 

      const createdCount = projects.filter((p: any) => isSameCalendarDay(d, p.createdAt)).length;
      const completedCount = projects.filter((p: any) => {
        if (p.status !== "Completed") return false;
        if (p.completedAt === localDateStr) return true;
        if (!p.completedAt && isSameCalendarDay(d, p.updatedAt)) return true;
        return false;
      }).length;

      days.push({ date: label, created: createdCount, completed: completedCount });
    }
    return days;
  }, [projects]);

  const totalTasks = projects.length;
  const completedTasks = projects.filter((p: any) => p.status === "Completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const priorityCounts = useMemo(() => {
    const high = projects.filter((p: any) => p.priority === "High").length;
    const medium = projects.filter((p: any) => p.priority === "Medium").length;
    const low = projects.filter((p: any) => p.priority === "Low").length;
    if (totalTasks === 0) return [{ name: 'No Tasks', value: 1, color: '#333' }];
    return [
      { name: 'High', value: high, color: '#f43f5e' },
      { name: 'Medium', value: medium, color: '#f59e0b' },
      { name: 'Low', value: low, color: '#10b981' },
    ];
  }, [projects, totalTasks]);

  const activeTypes = priorityCounts.filter(p => p.value > 0 && p.name !== 'No Tasks').length;

  if (isLoading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center transition-colors">
            <div className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Calculating Insights...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden transition-colors duration-300">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 dark:bg-indigo-900/10 blur-[120px]"></div>
         <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/5 dark:bg-emerald-900/10 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 p-4 md:p-10 space-y-6 md:space-y-8 pb-24 max-w-7xl mx-auto">
        
        {/* HEADER (Button Removed) */}
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics & Insights</h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="Total Tasks" value={totalTasks} icon={<Circle size={20} className="text-indigo-400" />} borderColor="border-indigo-500/20" />
          <StatCard title="Completed" value={completedTasks} icon={<CheckCircle2 size={20} className="text-emerald-400" />} borderColor="border-emerald-500/20" />
          <StatCard title="Pending" value={pendingTasks} icon={<Clock size={20} className="text-amber-400" />} borderColor="border-amber-500/20" />
          <StatCard title="Completion Rate" value={`${completionRate}%`} icon={<Activity size={20} className="text-rose-400" />} borderColor="border-rose-500/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Task Trends Chart */}
          <div className="p-4 md:p-6 rounded-3xl bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 flex flex-col h-[350px] md:h-[450px] shadow-sm dark:shadow-none">
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-4 md:mb-6">Task Activity (Last 30 Days)</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e2e8f0"} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke={isDark ? "#64748b" : "#94a3b8"} 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10} 
                    minTickGap={30} 
                  />
                  <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} width={25} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#0A0A0A' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', borderRadius: '12px', color: isDark ? '#fff' : '#0f172a', fontSize: '12px', boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                    itemStyle={{ color: isDark ? '#fff' : '#0f172a' }}
                  />
                  <Area type="monotone" dataKey="created" name="Created" stroke="#6366f1" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={3} />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300">Created</span>
              </div>
            </div>
          </div>

          {/* Priority Distribution Chart */}
          <div className="p-4 md:p-6 rounded-3xl bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 flex flex-col h-[400px] md:h-[450px] shadow-sm dark:shadow-none">
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2">Priority Distribution</h3>
            <div className="flex flex-col sm:flex-row flex-1 items-center">
              <div className="relative w-full sm:flex-1 h-[250px] md:h-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={priorityCounts}
                       cx="50%"
                       cy="50%"
                       innerRadius={window.innerWidth < 768 ? 60 : 80}
                       outerRadius={window.innerWidth < 768 ? 90 : 110}
                       paddingAngle={activeTypes > 1 ? 5 : 0} 
                       dataKey="value"
                       stroke="none"
                     >
                       {priorityCounts.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <PieTooltip 
                        contentStyle={{ backgroundColor: isDark ? '#0A0A0A' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', borderRadius: '12px', boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                        itemStyle={{ color: isDark ? '#fff' : '#0f172a' }}
                        cursor={false}
                      />
                   </PieChart>
                 </ResponsiveContainer>
                 {/* Center Label */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                   <div className="text-center"> 
                     <span className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white block drop-shadow-lg">{totalTasks}</span>
                     <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Total</span>
                   </div>
                 </div>
              </div>
              {/* Legend */}
              <div className="w-full sm:w-1/3 flex flex-row sm:flex-col justify-center items-center sm:items-start gap-4 sm:gap-4 sm:pl-4 mt-4 sm:mt-0">
                {priorityCounts.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}></div>
                    <div className="text-left">
                      <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, borderColor }: any) {
  return (
    <div className={`p-4 md:p-6 rounded-3xl bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:${borderColor} hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group shadow-sm dark:shadow-none`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">{title}</p>
        <div className="p-1.5 md:p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1 md:mt-2">{value}</h3>
    </div>
  );
}
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip 
} from 'recharts';
import { CheckCircle2, Circle, Clock, Activity } from "lucide-react";
import { useEffect, useState, useMemo } from 'react';
import axios from "axios";

// 1. DYNAMIC API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Analytics() {
  
  // STATE: Load Real Data from API
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // PRIVACY FIX: Get User Email
    const user = JSON.parse(localStorage.getItem("flowstate_user") || "{}");
    const userEmail = user.email;

    const fetchTasks = async () => {
      // If no user is logged in, stop here
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      try {
        // UPDATED: Use Dynamic API URL
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

  // 2. HELPER: Generate Last 30 Days (TIMEZONE FIXED)
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

      const createdCount = projects.filter((p: any) => 
        isSameCalendarDay(d, p.createdAt)
      ).length;

      const completedCount = projects.filter((p: any) => {
        if (p.status !== "Completed") return false;
        if (p.completedAt === localDateStr) return true;
        if (!p.completedAt && isSameCalendarDay(d, p.updatedAt)) return true;
        return false;
      }).length;

      days.push({
        date: label,
        created: createdCount,
        completed: completedCount
      });
    }
    return days;
  }, [projects]);

  // 3. STATS CALCULATIONS
  const totalTasks = projects.length;
  const completedTasks = projects.filter((p: any) => p.status === "Completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // 4. PRIORITY DISTRIBUTION
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
    return <div className="p-10 text-center text-slate-500 animate-pulse">Calculating Insights...</div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics & Insights</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={totalTasks} icon={<Circle size={20} className="text-indigo-400" />} borderColor="border-indigo-500/20" />
        <StatCard title="Completed" value={completedTasks} icon={<CheckCircle2 size={20} className="text-emerald-400" />} borderColor="border-emerald-500/20" />
        <StatCard title="Pending" value={pendingTasks} icon={<Clock size={20} className="text-amber-400" />} borderColor="border-amber-500/20" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={<Activity size={20} className="text-rose-400" />} borderColor="border-rose-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Trends Chart */}
        <div className="p-6 rounded-3xl bg-black border border-white/10 flex flex-col h-[450px]">
          <h3 className="text-lg font-bold text-white mb-6">Task Activity (Last 30 Days)</h3>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '12px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="created" name="Created" stroke="#6366f1" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={3} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-sm font-medium text-slate-300">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
              <span className="text-sm font-medium text-slate-300">Created</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className="p-6 rounded-3xl bg-black border border-white/10 flex flex-col h-[450px]">
          <h3 className="text-lg font-bold text-white mb-2">Priority Distribution</h3>
          <div className="flex flex-1 items-center">
            <div className="relative flex-1 h-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={activeTypes > 1 ? 5 : 0} 
                      dataKey="value"
                      stroke="none"
                    >
                      {priorityCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <PieTooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '12px' }} 
                      itemStyle={{ color: '#fff' }}
                      cursor={false}
                    />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                 <div className="text-center"> 
                   <span className="text-4xl font-black text-white block drop-shadow-lg">{totalTasks}</span>
                   <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total</span>
                 </div>
               </div>
            </div>
            <div className="w-1/3 pl-4 flex flex-col justify-center gap-4">
              {priorityCounts.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}></div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.value} Tasks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, borderColor }: any) {
  return (
    <div className={`p-6 rounded-3xl bg-black border ${borderColor} hover:bg-white/5 transition-colors group`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <div className="p-2 bg-white/5 rounded-full text-slate-300 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-4xl font-bold text-white mt-2">{value}</h3>
    </div>
  );
}
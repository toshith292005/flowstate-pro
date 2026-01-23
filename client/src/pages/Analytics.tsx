import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip 
} from 'recharts';
import { CheckCircle2, Circle, Clock, Activity, TrendingUp, Filter } from "lucide-react";
import { useEffect, useState, useMemo } from 'react';
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // 1. DATA PROCESSING: 30-Day Activity Trend
  const trendData = useMemo(() => {
    const days = [];
    const getLocalYYYYMMDD = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateStr = getLocalYYYYMMDD(d); 

      const created = projects.filter((p: any) => p.createdAt?.startsWith(dateStr)).length;
      const completed = projects.filter((p: any) => p.status === "Completed" && p.completedAt === dateStr).length;

      days.push({ date: label, created, completed });
    }
    return days;
  }, [projects]);

  // 2. STATS CALCULATIONS
  const totalTasks = projects.length;
  const completedTasks = projects.filter((p: any) => p.status === "Completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // 3. PRIORITY DATA
  const priorityData = useMemo(() => {
    return [
      { name: 'High', value: projects.filter((p: any) => p.priority === "High").length, color: '#f43f5e' },
      { name: 'Medium', value: projects.filter((p: any) => p.priority === "Medium").length, color: '#f59e0b' },
      { name: 'Low', value: projects.filter((p: any) => p.priority === "Low").length, color: '#10b981' },
    ].filter(p => p.value > 0);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Activity className="animate-pulse text-indigo-500" size={40} />
        <p className="text-slate-500 font-medium">Analyzing your productivity...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 pb-32 space-y-8 max-w-7xl mx-auto bg-black min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-slate-400 text-sm">
          <Filter size={16} /> Last 30 Days
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total" value={totalTasks} icon={<Circle size={18} />} color="text-indigo-400" />
        <StatCard title="Done" value={completedTasks} icon={<CheckCircle2 size={18} />} color="text-emerald-400" />
        <StatCard title="Pending" value={pendingTasks} icon={<Clock size={18} />} color="text-amber-400" />
        <StatCard title="Flow Rate" value={`${completionRate}%`} icon={<TrendingUp size={18} />} color="text-rose-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TREND CHART - Takes up 2/3 of space on desktop */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col h-[400px]">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
             Task Momentum
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={10} tickLine={false} axisLine={false} minTickGap={40} />
                <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="transparent" strokeWidth={3} />
                <Area type="monotone" dataKey="created" stroke="#6366f1" fillOpacity={1} fill="url(#grad1)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART - Takes up 1/3 of space on desktop */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col h-[400px] relative">
          <h3 className="text-white font-bold mb-2">Priority Focus</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip 
                   contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-4">
              <p className="text-2xl font-black text-white leading-none">{totalTasks}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Total</p>
            </div>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-2">
            {priorityData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
      <div className={`p-2 rounded-xl bg-white/5 ${color} mb-3`}>{icon}</div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
    </div>
  );
}
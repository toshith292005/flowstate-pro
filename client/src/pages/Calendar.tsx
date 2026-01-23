import { useState, useEffect } from "react";
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays 
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, List } from "lucide-react";
import axios from "axios";

// 1. DYNAMIC API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [projects, setProjects] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(new Date());
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
        console.error("Error loading calendar data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // CALENDAR LOGIC (Grid)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // MOBILE LOGIC (Date Strip - shows 14 days)
  const mobileDays = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i - 3));

  const getTasksForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return projects.filter((p: any) => p.dueDate === dateString);
  };

  const selectedTasks = getTasksForDay(selectedDate);

  return (
    <div className="p-4 md:p-10 pb-32 space-y-6 max-w-7xl mx-auto h-screen flex flex-col overflow-hidden bg-black">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Schedule</h1>
        
        {/* Month Navigation (Hidden on Mobile Strip View) */}
        <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-white font-bold min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* MOBILE DATE STRIP (Visible only on small screens) */}
      <div className="md:hidden flex gap-3 overflow-x-auto pb-4 no-scrollbar shrink-0">
        {mobileDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const hasTasks = getTasksForDay(day).length > 0;
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`flex-shrink-0 w-16 py-4 rounded-2xl border transition-all flex flex-col items-center relative ${
                isSelected 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30" 
                : "bg-white/5 border-white/5 text-slate-400"
              }`}
            >
              <span className="text-[10px] uppercase font-bold opacity-60">{format(day, "EEE")}</span>
              <span className="text-xl font-black mt-1">{format(day, "d")}</span>
              {hasTasks && !isSelected && <div className="absolute bottom-2 w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse">Loading...</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
          
          {/* DESKTOP GRID (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex-col min-h-0">
            <div className="grid grid-cols-7 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-2 overflow-y-auto pr-2 custom-scrollbar">
              {calendarDays.map((day, idx) => {
                const tasks = getTasksForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col min-h-[80px]
                      ${isSelected ? "bg-indigo-900/30 border-indigo-500 shadow-lg" : "bg-white/5 border-transparent hover:border-white/20"}
                      ${!isCurrentMonth && "opacity-20"}
                    `}
                  >
                    <span className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-indigo-500 text-white" : "text-slate-300"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="space-y-1">
                      {tasks.slice(0, 2).map((t: any) => (
                        <div key={t._id} className="h-1 w-full bg-indigo-500/50 rounded-full"></div>
                      ))}
                      {tasks.length > 2 && <div className="text-[8px] text-slate-500">+{tasks.length - 2}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TASK LIST (Sidebar on Desktop, Main View on Mobile) */}
          <div className="w-full lg:w-96 flex flex-col h-full min-h-0">
            <div className="mb-4 flex items-center justify-between shrink-0 px-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <List size={18} className="text-indigo-400" />
                {isSameDay(selectedDate, new Date()) ? "Today's Schedule" : format(selectedDate, "MMM do")}
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg">
                {selectedTasks.length} Tasks
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar pb-10">
              {selectedTasks.length > 0 ? (
                selectedTasks.map((task: any) => (
                  <div key={task._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {task.priority}
                      </span>
                      {task.status === "Completed" && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </div>
                    <h4 className="font-bold text-white text-sm">{task.title}</h4>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {task.category}</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">{task.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                  <CalendarIcon size={32} className="mb-2" />
                  <p className="text-xs">No deadlines today</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
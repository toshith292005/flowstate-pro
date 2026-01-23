import { useState, useEffect } from "react";
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths 
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import axios from "axios";

// 1. DYNAMIC API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Calendar() {
  // 1. STATE
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [projects, setProjects] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // 2. LOAD DATA FROM BACKEND (PRIVACY FIX + DYNAMIC URL APPLIED)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("flowstate_user") || "{}");
    const userEmail = user.email;

    const fetchTasks = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      try {
        // Updated to use Dynamic API URL
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

  // 3. LOGIC
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getTasksForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return projects.filter((p: any) => p.dueDate === dateString);
  };

  const selectedTasks = getTasksForDay(selectedDate);

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col gap-4 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Calendar View</h1>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-white font-bold min-w-[120px] text-center select-none">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse">Loading Calendar...</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          
          {/* LEFT: Calendar Grid */}
          <div className="flex-1 bg-black border border-white/10 rounded-3xl p-4 md:p-6 flex flex-col shadow-2xl min-h-0">
            <div className="grid grid-cols-7 mb-2 shrink-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-2 overflow-y-auto custom-scrollbar pr-1">
              {calendarDays.map((day, idx) => {
                const tasks = getTasksForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 overflow-hidden min-h-[80px]
                      ${isSelected 
                        ? "bg-indigo-900/20 border-indigo-500 z-10 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                        : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                      }
                      ${!isCurrentMonth && "opacity-30 bg-transparent"}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday 
                          ? "bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/50" 
                          : "text-slate-300"
                        }`}>
                        {format(day, "d")}
                      </span>
                      {tasks.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-500 bg-black/40 px-1.5 rounded-md">
                          {tasks.length}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                      {tasks.slice(0, 3).map((task: any) => (
                        <div key={task._id} className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium border border-transparent
                          ${task.priority === 'High' ? 'bg-rose-500/10 text-rose-300 border-rose-500/10' : 
                            task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-300 border-amber-500/10' : 
                            'bg-emerald-500/10 text-emerald-300 border-emerald-500/10'}`
                        }>
                          {task.title}
                        </div>
                      ))}
                      {tasks.length > 3 && (
                        <span className="text-[10px] text-slate-500 pl-1">+{tasks.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="w-full lg:w-96 bg-black border border-white/10 rounded-3xl p-6 flex flex-col h-full shadow-2xl shrink-0 min-h-0">
            <div className="mb-4 pb-4 border-b border-white/10 shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon size={18} className="text-indigo-400" />
                {format(selectedDate, "EEEE, MMM do")}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {selectedTasks.length === 0 ? "No deadlines" : `${selectedTasks.length} tasks due`}
              </p>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {selectedTasks.length > 0 ? (
                selectedTasks.map((task: any) => (
                  <div key={task._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        task.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {task.priority}
                      </span>
                      {task.status === "Completed" && <span className="text-emerald-400"><CheckCircle2 size={16} /></span>}
                    </div>
                    <h4 className={`font-bold text-sm line-clamp-2 ${task.status === "Completed" ? "text-slate-500 line-through decoration-slate-600" : "text-white"}`}>
                      {task.title}
                    </h4>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Due Today</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded">{task.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <CalendarIcon size={32} className="opacity-20 mb-3" />
                  <p>No deadlines set for this day.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
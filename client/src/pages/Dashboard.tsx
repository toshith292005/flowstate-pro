import { useState, useMemo, useEffect } from "react";
import { Plus, CheckCircle2, Circle, Search, Calendar, Trash2, Edit2, AlertTriangle, BarChart3, X, Loader2, RefreshCcw, Filter } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Task {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string;
  progress: number;
  userEmail?: string;
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("flowstate_user") || "{}");
  const userEmail = user.email; 

  const [projects, setProjects] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    if (!userEmail) {
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    
    const wakeUpTimer = setTimeout(() => {
      setIsWakingUp(true);
    }, 3000);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/tasks`, {
        params: { email: userEmail } 
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      clearTimeout(wakeUpTimer);
      setIsLoading(false);
      setIsWakingUp(false);
    }
  };

  // UI STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterPriority, setFilterPriority] = useState("All Priority");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // FORM STATE
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState(""); 
  const [formPriority, setFormPriority] = useState("Medium");
  const [formDueDate, setFormDueDate] = useState("");
  const [formStatus, setFormStatus] = useState("To Do");
  const [formProgress, setFormProgress] = useState(0);

  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  // --- ACTIONS ---

  const handleStatusChange = (newStatus: string) => {
    setFormStatus(newStatus);
    if (newStatus === "Completed") setFormProgress(100); 
    else if (newStatus === "To Do") setFormProgress(0);
    else if (newStatus === "In Progress" && (formProgress === 0 || formProgress === 100)) {
        setFormProgress(50);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    setFormProgress(val);
    if (val === 0) setFormStatus("To Do");
    else if (val === 100) setFormStatus("Completed");
    else setFormStatus("In Progress");
  };

  const handleToggleComplete = async (task: Task) => {
    const isComplete = task.status === "Completed";
    const newStatus = isComplete ? "To Do" : "Completed";
    const newProgress = isComplete ? 0 : 100;
    const completedAt = isComplete ? null : getLocalDate();

    const updatedTask = { ...task, status: newStatus, progress: newProgress, completedAt };
    setProjects(projects.map(p => p._id === task._id ? updatedTask : p));

    try {
        await axios.put(`${API_BASE_URL}/api/tasks/${task._id}`, updatedTask);
    } catch (err) {
        alert("Failed to update task");
        fetchTasks(); 
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/tasks/${id}`);
        setProjects(projects.filter((p: any) => p._id !== id));
      } catch (err) {
        alert("Failed to delete task");
      }
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const today = getLocalDate();
    const completedAtDate = formStatus === "Completed" ? today : null;

    const taskData = {
      userEmail: userEmail, 
      title: formTitle,
      category: formCategory || "General",
      priority: formPriority,
      status: formStatus,
      dueDate: formDueDate || today,
      progress: Number(formProgress),
      completedAt: completedAtDate
    };

    try {
      if (editingId) {
        const res = await axios.put(`${API_BASE_URL}/api/tasks/${editingId}`, taskData);
        setProjects(projects.map((p: any) => (p._id === editingId ? res.data : p)));
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/tasks`, taskData);
        setProjects([res.data, ...projects]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save task. Check server console!");
    }
  };

  // LOGIC & FILTERING
  const totalTasks = projects.length;
  const completedTasks = projects.filter((p: any) => p.status === "Completed").length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(projects.map((p: any) => p.category));
    return ["All Categories", ...Array.from(cats)];
  }, [projects]);

  const isOverdue = (dateString: string, status: string) => {
    if (status === "Completed" || !dateString) return false;
    return new Date(dateString) < new Date();
  };

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All Status" || p.status === filterStatus;
    const matchesPriority = filterPriority === "All Priority" || p.priority === filterPriority;
    const matchesCategory = filterCategory === "All Categories" || p.category === filterCategory;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingId(null); setFormTitle(""); setFormCategory(""); setFormPriority("Medium");
    setFormDueDate(""); setFormStatus("To Do"); setFormProgress(0); setIsModalOpen(true);
  };

  const openEditModal = (project: any) => {
    setEditingId(project._id); setFormTitle(project.title); setFormCategory(project.category);
    setFormPriority(project.priority); setFormDueDate(project.dueDate || "");
    setFormStatus(project.status); setFormProgress(project.progress); setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]"></div>
         <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 p-4 md:p-10 space-y-8 pb-20 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {/* REMOVED: Subtitle text here */}
          </div>
          <button onClick={openCreateModal} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
            <Plus size={18} /> New Task
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Tasks" value={totalTasks} icon={<Circle size={20} className="text-indigo-400" />} color="bg-indigo-400/10 border-indigo-400/20 text-indigo-400" />
          <StatCard title="Completed" value={completedTasks} icon={<CheckCircle2 size={20} className="text-emerald-400" />} color="bg-emerald-400/10 border-emerald-400/20 text-emerald-400" />
          <StatCard title="Completion Rate" value={`${completionRate}%`} icon={<BarChart3 size={20} className="text-amber-400" />} color="bg-amber-400/10 border-amber-400/20 text-amber-400" />
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                // text-base prevents ios zoom
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-base" 
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <div className="relative shrink-0">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white/5 border border-white/10 text-slate-300 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-indigo-500 appearance-none hover:bg-white/10 transition-colors w-full min-w-[140px]">
                {uniqueCategories.map((cat: any) => <option key={cat} value={cat} className="bg-black text-white">{cat}</option>)}
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            
            <div className="relative shrink-0">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white/5 border border-white/10 text-slate-300 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-indigo-500 appearance-none hover:bg-white/10 transition-colors w-full min-w-[130px]">
                <option className="bg-black text-white">All Status</option>
                <option className="bg-black text-white">To Do</option>
                <option className="bg-black text-white">In Progress</option>
                <option className="bg-black text-white">Completed</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative shrink-0">
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-white/5 border border-white/10 text-slate-300 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-indigo-500 appearance-none hover:bg-white/10 transition-colors w-full min-w-[130px]">
                <option className="bg-black text-white">All Priority</option>
                <option className="bg-black text-white">Low</option>
                <option className="bg-black text-white">Medium</option>
                <option className="bg-black text-white">High</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* TASK CONTENT SECTION */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
            <h3 className="text-xl font-bold text-white mb-2">Connecting to FlowState</h3>
            <p className="max-w-xs mx-auto text-sm">
              {isWakingUp 
                ? "The server is currently waking up from hibernation. This can take about 30-60 seconds on the free tier." 
                : "Fetching your personalized dashboard..."}
            </p>
            {isWakingUp && (
              <button onClick={fetchTasks} className="mt-6 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold">
                <RefreshCcw size={16} /> Try Refreshing
              </button>
            )}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => {
              const overdue = isOverdue(project.dueDate, project.status);
              return (
                <div key={project._id} className={`p-6 rounded-3xl bg-white/5 backdrop-blur-md border transition-all group relative overflow-hidden flex flex-col h-full ${overdue ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : "border-white/10 hover:border-indigo-500/50 hover:bg-white/10"}`}>
                  
                  {overdue && <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>}
                  
                  <div className="relative z-10 flex flex-col gap-4 h-full">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/40 text-slate-300 border border-white/5">{project.category}</span>
                      
                      {/* OPTIMIZATION: Actions always visible on mobile (opacity-100), hover on desktop (lg:opacity-0) */}
                      <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleComplete(project)} 
                          title={project.status === "Completed" ? "Mark as To Do" : "Mark as Completed"}
                          className={`p-1.5 rounded-lg transition-colors ${project.status === "Completed" ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" : "text-slate-400 hover:text-emerald-400 hover:bg-white/10"}`}
                        >
                            <CheckCircle2 size={18} />
                        </button>
                        <button onClick={() => openEditModal(project)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(project._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-lg font-bold text-white line-clamp-1 ${project.status === "Completed" ? "line-through opacity-50 decoration-slate-500" : ""}`}>{project.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-white/5 ${project.priority === "High" ? "bg-rose-500/20 text-rose-400" : project.priority === "Medium" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-500"}`}>{project.priority}</span>
                          <span className={`text-xs flex items-center gap-1 ${overdue ? "text-red-400 font-bold animate-pulse" : "text-slate-500"}`}>{overdue ? <AlertTriangle size={12} /> : <Calendar size={12} />} {overdue ? "Overdue: " : "Due: "} {project.dueDate}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto space-y-2">
                      <div className="flex justify-between text-xs font-medium text-slate-400"><span>{project.status}</span><span>{project.progress}%</span></div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${overdue ? "bg-red-500" : project.status === "Completed" ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`} style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
             <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6"><Plus size={40} className="text-slate-500" /></div>
             <h3 className="text-2xl font-bold text-white">No Tasks Found</h3>
             <p className="text-slate-400 mt-2 text-center max-w-sm">Create a new task to get started!</p>
             <button onClick={openCreateModal} className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all">+ Create New Task</button>
          </div>
        )}

        {/* MODAL SECTION */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            {/* OPTIMIZATION: max-h-[90vh] ensures modal fits on small screens with scroll */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
              <h2 className="text-2xl font-bold text-white mb-6">{editingId ? "Edit Task" : "Create New Task"}</h2>
              <form onSubmit={handleSaveProject} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Task Name</label>
                    <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-base" autoFocus placeholder="What needs to be done?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300">Category</label>
                      <input type="text" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-base" placeholder="e.g. Work" />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300">Priority</label>
                      <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none text-base"><option className="bg-black">Low</option><option className="bg-black">Medium</option><option className="bg-black">High</option></select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300">Status</label>
                      <select value={formStatus} onChange={(e) => handleStatusChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none text-base"><option className="bg-black">To Do</option><option className="bg-black">In Progress</option><option className="bg-black">Completed</option></select>
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300">Progress (%)</label>
                      <input type="number" min="0" max="100" value={formProgress} onChange={handleProgressChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-base" />
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Due Date</label>
                    <input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all [color-scheme:dark] text-base" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 mt-2">{editingId ? "Save Changes" : "Create Task"}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        </div>
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CheckCircle2, 
  Settings, 
  LogOut, 
  Menu, 
  Search, 
  Bell, 
  HelpCircle, 
  Plus, 
  Hourglass, 
  Check, 
  XCircle, 
  Inbox, 
  ArrowRight, 
  Stethoscope, 
  User, 
  Plane, 
  Baby, 
  Filter, 
  Download, 
  Eye,
  ChevronRight,
  ChevronDown
} from "lucide-react";

// Adjust these paths to match your project structure
import { supabase } from "../../supabase/supabase"; 
import SuperAuthGuard from "../Auth/SuperAuthGuard"; 

const LeaveRequestsContent = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  // --- 1. Fetch Data ---
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  async function fetchLeaveRequests() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setRequests(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }

  const calculateStats = (data) => {
    const pending = data.filter(r => r.status === 'Pending').length;
    const approved = data.filter(r => r.status === 'Approved').length;
    const rejected = data.filter(r => r.status === 'Rejected').length;
    setStats({ pending, approved, rejected });
  };

  // --- 2. Handle Actions ---
  const handleAction = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Optimistic Update
      const updatedRequests = requests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      );
      setRequests(updatedRequests);
      calculateStats(updatedRequests);

    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // --- 3. UI Helpers ---
  const getTheme = (type) => {
    switch (type?.toLowerCase()) {
      case 'sick leave': 
        return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'bg-blue-500', icon: <Stethoscope size={18} className="text-blue-500"/>, ring: 'ring-blue-700/10' };
      case 'personal': 
        return { color: 'text-purple-700', bg: 'bg-purple-50', border: 'bg-purple-500', icon: <User size={18} className="text-purple-500"/>, ring: 'ring-purple-700/10' };
      case 'vacation': 
        return { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'bg-yellow-500', icon: <Plane size={18} className="text-yellow-600"/>, ring: 'ring-yellow-600/20' };
      case 'maternity': 
        return { color: 'text-pink-700', bg: 'bg-pink-50', border: 'bg-pink-500', icon: <Baby size={18} className="text-pink-500"/>, ring: 'ring-pink-700/10' };
      default: 
        return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'bg-gray-500', icon: <User size={18} className="text-gray-500"/>, ring: 'ring-gray-600/20' };
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <div className="flex h-screen w-full bg-[#f6f6f8] text-[#111318] overflow-hidden font-sans">
      {/* Font Injection for Exact Look */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap');
        body { font-family: 'Manrope', sans-serif; }
      `}</style>

      {/* --- Sidebar --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#f0f2f4] transition-transform duration-300 lg:static lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-[#f0f2f4]">
          <div className="flex items-center gap-3 text-[#135bec]">
            <div className="h-9 w-9 rounded-xl bg-[#135bec] flex items-center justify-center shadow-lg shadow-[#135bec]/30">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#111318]">HR Portal</h1>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden text-gray-500">
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#616f89] hover:bg-[#f8f9fa] hover:text-[#135bec] transition-all group">
            <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#616f89] hover:bg-[#f8f9fa] hover:text-[#135bec] transition-all group">
            <Users size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Employees</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#616f89] hover:bg-[#f8f9fa] hover:text-[#135bec] transition-all group">
            <CalendarDays size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Attendance</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#135bec] text-white shadow-lg shadow-[#135bec]/25 transition-all">
            <CheckCircle2 size={20} className="fill-current" />
            <span className="text-sm font-bold">Leave Requests</span>
          </a>

          <div className="my-4 border-t border-gray-100"></div>
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preferences</p>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#616f89] hover:bg-[#f8f9fa] hover:text-[#135bec] transition-all group">
            <Settings size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Settings</span>
          </a>
        </div>
        
        <div className="p-6 border-t border-[#f0f2f4]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8f9fa] border border-gray-100">
             <img src="https://ui-avatars.com/api/?name=Alexander+P&background=random" className="h-10 w-10 rounded-lg object-cover" alt="Admin" />
             <div className="flex flex-col overflow-hidden">
                <p className="text-[#111318] text-sm font-bold truncate">Alexander P.</p>
                <p className="text-[#616f89] text-xs truncate">Super Admin</p>
             </div>
          </div>
          <a href="#" className="mt-4 flex items-center gap-3 px-4 py-2 text-[#616f89] hover:text-red-500 transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </a>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-[#f8fafc]">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 lg:px-8 py-4 bg-white border-b border-[#f0f2f4] h-20 shrink-0 z-20 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
           <div className="flex items-center gap-4">
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 text-[#111318] hover:bg-gray-100 rounded-xl">
                 <Menu size={24} />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-sm text-[#616f89]">
                 <LayoutDashboard size={18} className="text-gray-400" />
                 <ChevronRight size={16} />
                 <span className="hover:text-[#135bec] cursor-pointer">Dashboard</span>
                 <ChevronRight size={16} />
                 <span className="text-[#111318] font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">Leave Management</span>
              </div>
           </div>

           <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#135bec] transition-colors" size={20} />
              <input 
                 type="text" 
                 placeholder="Search for employees, leave types, dates..." 
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f0f2f4] border-none text-sm text-[#111318] focus:ring-2 focus:ring-[#135bec]/20 placeholder:text-gray-500 transition-all focus:bg-white shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                 <kbd className="hidden sm:inline-block border border-gray-200 rounded px-1.5 text-[10px] font-bold text-gray-400 font-sans">CMD+K</kbd>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button className="relative text-[#616f89] hover:text-[#135bec] hover:bg-[#135bec]/5 transition-all p-2 rounded-xl">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>
              <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all text-sm font-medium text-[#111318]">
                 <HelpCircle size={18} className="text-gray-400" />
                 <span>Support</span>
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-10 scroll-smooth">
           <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
              
              {/* Title Area */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#111318] tracking-tight">Leave Management</h2>
                    <p className="text-[#616f89] mt-2 text-base">Track and manage employee time off requests.</p>
                 </div>
                 <button className="flex items-center gap-2 bg-[#135bec] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                    <Plus size={20} />
                    New Leave Request
                 </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Card 1 */}
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-2 relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                       <Hourglass size={120} className="text-[#135bec]" />
                    </div>
                    <div className="flex items-center justify-between z-10">
                       <div>
                          <p className="text-[#616f89] text-sm font-semibold uppercase tracking-wider mb-1">Pending Requests</p>
                          <p className="text-[#111318] text-4xl font-bold">{stats.pending}</p>
                       </div>
                       <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-[#135bec]">
                          <Hourglass size={24} />
                       </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#135bec] font-medium mt-2 z-10 bg-blue-50/50 w-fit px-2 py-1 rounded-lg">
                       <span>2 new today</span>
                    </div>
                 </div>

                 {/* Card 2 */}
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-2 relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                       <CheckCircle2 size={120} className="text-green-500" />
                    </div>
                    <div className="flex items-center justify-between z-10">
                       <div>
                          <p className="text-[#616f89] text-sm font-semibold uppercase tracking-wider mb-1">Approved (Oct)</p>
                          <p className="text-[#111318] text-4xl font-bold">{stats.approved}</p>
                       </div>
                       <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                          <Check size={24} />
                       </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-500 font-medium mt-2 z-10 bg-green-50/50 w-fit px-2 py-1 rounded-lg">
                       <span>+12% vs last month</span>
                    </div>
                 </div>

                 {/* Card 3 */}
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-2 relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                       <XCircle size={120} className="text-red-500" />
                    </div>
                    <div className="flex items-center justify-between z-10">
                       <div>
                          <p className="text-[#616f89] text-sm font-semibold uppercase tracking-wider mb-1">Rejected (Oct)</p>
                          <p className="text-[#111318] text-4xl font-bold">{stats.rejected}</p>
                       </div>
                       <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                          <XCircle size={24} />
                       </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#616f89] font-medium mt-2 z-10 bg-gray-100 w-fit px-2 py-1 rounded-lg">
                       <span>Stable rate</span>
                    </div>
                 </div>
              </div>

              {/* Needs Attention Section */}
              <div className="flex flex-col gap-5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <h3 className="text-xl font-bold text-[#111318] flex items-center gap-2">
                          <Inbox className="text-[#135bec]" size={24} />
                          Needs Attention
                       </h3>
                       <span className="bg-[#135bec] text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                    </div>
                    <a href="#" className="text-[#135bec] text-sm font-bold hover:underline flex items-center gap-1 group">
                       View All Requests
                       <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? <p>Loading requests...</p> : pendingRequests.slice(0, 3).map((req) => {
                       const theme = getTheme(req.leave_type);
                       return (
                          <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden">
                             {/* Colored Side Border */}
                             <div className={`absolute top-0 left-0 w-1 h-full ${theme.border}`}></div>
                             
                             <div className="p-6 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-5">
                                   <div className="flex items-center gap-4">
                                      <div className="relative">
                                         <img 
                                            src={req.avatar_url || `https://ui-avatars.com/api/?name=${req.employee_name}&background=random`} 
                                            className="rounded-2xl h-14 w-14 border-2 border-white shadow-md object-cover" 
                                            alt={req.employee_name} 
                                         />
                                         <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                            {theme.icon}
                                         </div>
                                      </div>
                                      <div>
                                         <p className="text-[#111318] font-bold text-lg">{req.employee_name}</p>
                                         <p className="text-[#616f89] text-sm">{req.role}</p>
                                      </div>
                                   </div>
                                   <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold ring-1 ring-inset uppercase tracking-wide ${theme.bg} ${theme.color} ${theme.ring}`}>
                                      {req.leave_type}
                                   </span>
                                </div>

                                <div className="bg-[#f8fafc] rounded-xl p-4 mb-5 border border-dashed border-gray-200">
                                   <div className="flex items-center gap-2 mb-2 text-[#111318]">
                                      <CalendarDays size={20} className="text-[#616f89]" />
                                      <span className="font-bold">
                                         {format(parseISO(req.start_date), 'MMM dd')} - {format(parseISO(req.end_date), 'MMM dd')}
                                      </span>
                                      <span className="text-[#616f89] text-sm font-medium ml-1 bg-white px-2 py-0.5 rounded border border-gray-200">
                                         {differenceInDays(parseISO(req.end_date), parseISO(req.start_date)) + 1} Days
                                      </span>
                                   </div>
                                   <p className="text-sm text-[#616f89] leading-relaxed italic">"{req.reason}"</p>
                                </div>

                                <div className="flex gap-3 mt-auto">
                                   <button 
                                      onClick={() => handleAction(req.id, 'Approved')}
                                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-500/20 hover:shadow-green-500/40 flex items-center justify-center gap-2"
                                   >
                                      <Check size={18} /> Approve
                                   </button>
                                   <button 
                                      onClick={() => handleAction(req.id, 'Rejected')}
                                      className="flex-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                   >
                                      <XCircle size={18} /> Reject
                                   </button>
                                </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden mb-10">
                 <div className="p-6 border-b border-[#f0f2f4] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                    <div>
                       <h3 className="text-xl font-bold text-[#111318]">Leave History</h3>
                       <p className="text-sm text-[#616f89]">All past leave applications</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                       <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm text-[#111318]">
                          <Filter size={20} /> Filter
                       </button>
                       <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm text-[#111318]">
                          <Download size={20} /> Export
                       </button>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-gray-50 border-b border-[#f0f2f4]">
                             <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">Employee</th>
                             <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">Leave Type</th>
                             <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">Dates</th>
                             <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">Duration</th>
                             <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89]">Status</th>
                             <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#616f89] text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-[#f0f2f4]">
                          {requests.map((req) => (
                             <tr key={req.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="py-4 px-6">
                                   <div className="flex items-center gap-3">
                                      <img src={req.avatar_url || `https://ui-avatars.com/api/?name=${req.employee_name}`} className="h-10 w-10 rounded-full bg-cover shadow-sm" alt="" />
                                      <div className="flex flex-col">
                                         <span className="text-sm font-bold text-[#111318] group-hover:text-[#135bec] transition-colors">{req.employee_name}</span>
                                         <span className="text-xs text-[#616f89]">{req.role}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-4 px-6">
                                   <div className="flex items-center gap-2">
                                      <span className={`h-2 w-2 rounded-full ${getTheme(req.leave_type).border}`}></span>
                                      <span className="text-sm font-medium text-[#111318]">{req.leave_type}</span>
                                   </div>
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-[#111318]">
                                   {format(parseISO(req.start_date), 'MMM dd')} - {format(parseISO(req.end_date), 'MMM dd')}
                                </td>
                                <td className="py-4 px-6 text-sm text-[#616f89]">
                                   <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">
                                      {differenceInDays(parseISO(req.end_date), parseISO(req.start_date)) + 1} Days
                                   </span>
                                </td>
                                <td className="py-4 px-6">
                                   {req.status === 'Approved' && (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                                         <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span> Approved
                                      </span>
                                   )}
                                   {req.status === 'Rejected' && (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">
                                         <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span> Rejected
                                      </span>
                                   )}
                                   {req.status === 'Pending' && (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                         <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 animate-pulse"></span> Pending
                                      </span>
                                   )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                   <button className="text-[#616f89] hover:text-[#135bec] hover:bg-[#135bec]/10 transition-all p-2 rounded-lg">
                                      <Eye size={20} />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

           </div>
        </main>
      </div>
    </div>
  );
};

export default function LeaveRequests() {
  return (
    <SuperAuthGuard>
      <LeaveRequestsContent />
    </SuperAuthGuard>
  );
}
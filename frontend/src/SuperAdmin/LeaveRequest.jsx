import React, { useEffect, useState } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import SuperAuthGuard from "../Auth/SuperAuthGuard";
import { fetchAllLeaveRequests, superLogout } from "./super";

const LeaveRequestsContent = () => {
   const navigate = useNavigate();
   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

   // --- 1. Fetch Data ---
   useEffect(() => {
      fetchRequests();
   }, []);

   async function fetchRequests() {
      try {
         setLoading(true);
         const mergedData = await fetchAllLeaveRequests();
         if (mergedData) {
            setRequests(mergedData);
            calculateStats(mergedData);
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

   const handleLogout = async () => {
      if (window.confirm("Are you sure you want to log out?")) {
         await superLogout();
         navigate("/super/login");
      }
   };

   // --- 2. Handle Actions ---
   const handleAction = async (id, newStatus) => {
      try {
         const { error } = await supabase
            .from('leaves')
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
         alert("Failed to update status");
      }
   };

   // --- UI Helpers ---
   const getTheme = (type) => {
      switch (type?.toLowerCase()) {
         case 'sick leave':
            return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'bg-blue-500', icon: 'stethoscope', ring: 'ring-blue-700/10' };
         case 'personal':
            return { color: 'text-purple-700', bg: 'bg-purple-50', border: 'bg-purple-500', icon: 'person', ring: 'ring-purple-700/10' };
         case 'vacation':
            return { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'bg-yellow-500', icon: 'flight', ring: 'ring-yellow-600/20' };
         case 'maternity':
            return { color: 'text-pink-700', bg: 'bg-pink-50', border: 'bg-pink-500', icon: 'child_care', ring: 'ring-pink-700/10' };
         default:
            return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'bg-gray-500', icon: 'event_note', ring: 'ring-gray-600/20' };
      }
   };

   const pendingRequests = requests.filter(r => r.status === 'Pending');

   return (
      <div className="bg-background-light text-slate-900 h-screen flex overflow-hidden font-sans">
         <style dangerouslySetInnerHTML={{
            __html: `
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
            ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            body { font-family: 'Inter', sans-serif; }
            .bg-background-light { background-color: #f0f4f9; }
          `}} />

         {/* --- SIDEBAR --- */}
         <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
            <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
               <div className="flex items-center gap-2 text-[#137fec] font-bold text-xl tracking-tight">
                  <span className="material-symbols-outlined filled">hexagon</span>
                  HR Admin
               </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
               <div className="px-3 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Main</p>
               </div>
               <Link to="/super/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">dashboard</span>
                  <span className="text-sm font-medium">Dashboard</span>
               </Link>
               <Link to="/super/dashboard/employees" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">group</span>
                  <span className="text-sm font-medium">Employees</span>
               </Link>
               <Link to="/super/dashboard/leaves" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#137fec]/10 text-[#137fec] group border-l-4 border-[#137fec] shadow-sm">
                  <span className="material-symbols-outlined fill-1">assignment</span>
                  <span className="text-sm font-semibold">Leave Requests</span>
               </Link>
               <Link to="/super/dashboard/notification" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">notifications</span>
                  <span className="text-sm font-medium">Notifications</span>
               </Link>

               <div className="px-3 mt-6 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System</p>
               </div>
               <Link to="/super/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">person</span>
                  <span className="text-sm font-medium">My Profile</span>
               </Link>
               <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500">logout</span>
                  <span className="text-sm font-medium">Logout</span>
               </button>
            </nav>
         </aside>

         {/* --- MAIN CONTENT --- */}
         <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light ml-0 md:ml-0 relative">

            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="md:hidden flex items-center gap-2 text-[#137fec] font-bold text-xl">
                     <span className="material-symbols-outlined filled">hexagon</span>
                     HR Admin
                  </div>
                  <nav className="hidden md:flex items-center text-sm font-medium text-slate-500">
                     <Link to="/super/dashboard" className="hover:text-[#137fec] transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">home</span>
                        Home
                     </Link>
                     <span className="material-symbols-outlined text-[16px] text-slate-300 mx-1">chevron_right</span>
                     <span className="text-[#137fec] font-semibold bg-blue-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Leave Management</span>
                  </nav>
               </div>
               <div className="flex items-center gap-3">
                  <Link to="/super/dashboard/profile" className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#137fec] hover:bg-blue-50 transition-colors">
                     <span className="material-symbols-outlined">person</span>
                  </Link>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
               <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

                  {/* Title Area */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h2>
                        <p className="text-slate-500 mt-1 text-sm">Track and manage employee time off requests.</p>
                     </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* Card 1 */}
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                           <span className="material-symbols-outlined text-[#137fec] text-[120px]">hourglass_empty</span>
                        </div>
                        <div className="flex items-center justify-between z-10">
                           <div>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending</p>
                              <p className="text-slate-900 text-3xl font-bold">{stats.pending}</p>
                           </div>
                           <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#137fec]">
                              <span className="material-symbols-outlined">hourglass_empty</span>
                           </div>
                        </div>
                     </div>

                     {/* Card 2 */}
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                           <span className="material-symbols-outlined text-green-500 text-[120px]">check_circle</span>
                        </div>
                        <div className="flex items-center justify-between z-10">
                           <div>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Approved</p>
                              <p className="text-slate-900 text-3xl font-bold">{stats.approved}</p>
                           </div>
                           <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                              <span className="material-symbols-outlined">check_circle</span>
                           </div>
                        </div>
                     </div>

                     {/* Card 3 */}
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute -right-6 -top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                           <span className="material-symbols-outlined text-red-500 text-[120px]">cancel</span>
                        </div>
                        <div className="flex items-center justify-between z-10">
                           <div>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Rejected</p>
                              <p className="text-slate-900 text-3xl font-bold">{stats.rejected}</p>
                           </div>
                           <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                              <span className="material-symbols-outlined">cancel</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Needs Attention Section */}
                  <div className="flex flex-col gap-5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#137fec]">inbox</span>
                              Needs Attention
                           </h3>
                           <span className="bg-[#137fec] text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? <p className="text-slate-500">Loading requests...</p> : pendingRequests.slice(0, 3).map((req) => {
                           const theme = getTheme(req.leave_type);
                           return (
                              <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-hidden">
                                 {/* Colored Side Border */}
                                 <div className={`absolute top-0 left-0 w-1 h-full ${theme.border}`}></div>

                                 <div className="p-6 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-5">
                                       <div className="flex items-center gap-4">
                                          <div className="relative">
                                             <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl border-2 border-white shadow-sm">
                                                {req.employee_name?.charAt(0)}
                                             </div>
                                             <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-slate-600">
                                                <span className="material-symbols-outlined text-[16px]">{theme.icon}</span>
                                             </div>
                                          </div>
                                          <div>
                                             <p className="text-slate-900 font-bold text-base">{req.employee_name}</p>
                                             <p className="text-slate-500 text-xs">{req.role || 'Employee'}</p>
                                          </div>
                                       </div>
                                       <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ring-inset uppercase tracking-wide ${theme.bg} ${theme.color} ${theme.ring}`}>
                                          {req.leave_type}
                                       </span>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-3 mb-5 border border-slate-100">
                                       <div className="flex items-center gap-2 mb-2 text-slate-900">
                                          <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                                          <span className="font-bold text-sm">
                                             {format(parseISO(req.start_date), 'MMM dd')} - {format(parseISO(req.end_date), 'MMM dd')}
                                          </span>
                                          <span className="text-slate-500 text-xs font-medium ml-1 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                             {differenceInDays(parseISO(req.end_date), parseISO(req.start_date)) + 1} Days
                                          </span>
                                       </div>
                                       <p className="text-sm text-slate-600 leading-relaxed italic">"{req.reason}"</p>
                                    </div>

                                    <div className="flex gap-3 mt-auto">
                                       <button
                                          onClick={() => handleAction(req.id, 'Approved')}
                                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                                       >
                                          <span className="material-symbols-outlined text-[18px]">check</span> Approve
                                       </button>
                                       <button
                                          onClick={() => handleAction(req.id, 'Rejected')}
                                          className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                       >
                                          <span className="material-symbols-outlined text-[18px]">close</span> Reject
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* History Table */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden mb-10">
                     <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                        <div>
                           <h3 className="text-lg font-bold text-slate-900">Leave History</h3>
                           <p className="text-sm text-slate-500">All past leave applications</p>
                        </div>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                 <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
                                 <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Leave Type</th>
                                 <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Dates</th>
                                 <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Duration</th>
                                 <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                 <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {requests.map((req) => (
                                 <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-4 px-6">
                                       <div className="flex items-center gap-3">
                                          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                                             {req.employee_name?.charAt(0)}
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-sm font-bold text-slate-900 group-hover:text-[#137fec] transition-colors">{req.employee_name}</span>
                                             <span className="text-xs text-slate-500">{req.role || 'Employee'}</span>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="py-4 px-6">
                                       <div className="flex items-center gap-2">
                                          <span className={`h-2 w-2 rounded-full ${getTheme(req.leave_type).border}`}></span>
                                          <span className="text-sm font-medium text-slate-900">{req.leave_type}</span>
                                       </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-slate-700">
                                       {format(parseISO(req.start_date), 'MMM dd')} - {format(parseISO(req.end_date), 'MMM dd')}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-500">
                                       <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">
                                          {differenceInDays(parseISO(req.end_date), parseISO(req.start_date)) + 1} Days
                                       </span>
                                    </td>
                                    <td className="py-4 px-6">
                                       {req.status === 'Approved' && (
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                                             <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span> Approved
                                          </span>
                                       )}
                                       {req.status === 'Rejected' && (
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">
                                             <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span> Rejected
                                          </span>
                                       )}
                                       {req.status === 'Pending' && (
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-bold text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                             <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 animate-pulse"></span> Pending
                                          </span>
                                       )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                       <button className="text-slate-400 hover:text-[#137fec] hover:bg-blue-50 transition-all p-2 rounded-lg">
                                          <span className="material-symbols-outlined">visibility</span>
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

               </div>
            </div>
         </main>
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
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabase";
import SuperAuthGuard from "../Auth/SuperAuthGuard";
import { Link, useNavigate } from "react-router-dom";
import { superLogout } from "./super";

export default function Notification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: "all",
    title: "",
    description: "",
    type: "info",
  });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await superLogout();
      navigate("/super/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    try {
      let notifications = [];

      if (formData.userId === "all") {
        notifications = users.map(u => ({
          user_id: u.id,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          read: false
        }));
      } else {
        notifications.push({
          user_id: formData.userId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          read: false
        });
      }

      const { error } = await supabase
        .from("notifications")
        .insert(notifications);

      if (error) throw error;

      setSuccessMsg(`Successfully sent ${notifications.length} notification(s)!`);
      setFormData({ ...formData, title: "", description: "" });
    } catch (err) {
      console.error("Error sending notification:", err);
      // Friendly error
      alert("Failed to send: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAuthGuard>
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        body { font-family: 'Inter', sans-serif; }
        .bg-background-light { background-color: #f0f4f9; }
      `}} />

      <div className="bg-background-light text-slate-900 h-screen flex overflow-hidden">

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
            <Link to="/super/dashboard/leaves" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">assignment</span>
              <span className="text-sm font-medium">Leave Requests</span>
            </Link>
            <Link to="/super/dashboard/notification" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#137fec]/10 text-[#137fec] group border-l-4 border-[#137fec] shadow-sm">
              <span className="material-symbols-outlined fill-1">notifications</span>
              <span className="text-sm font-semibold">Notifications</span>
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
                <span className="text-[#137fec] font-semibold bg-blue-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Notifications</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/super/dashboard/profile" className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#137fec] hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined">person</span>
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-[#137fec]/10 flex items-center justify-center text-[#137fec]">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Notification Center</h1>
                  <p className="text-slate-500 text-sm">Send alerts and updates to your team.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">

                {successMsg && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    <div>
                      <p className="text-sm font-bold text-green-800">Success</p>
                      <p className="text-sm text-green-700">{successMsg}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Send To</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-400 material-symbols-outlined text-[20px]">person_search</span>
                      <select
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none transition-all appearance-none"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      >
                        <option value="all">📢 All Employees</option>
                        <optgroup label="Select Specific Employee">
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                          ))}
                        </optgroup>
                      </select>
                      <span className="absolute right-3 top-3 text-slate-400 material-symbols-outlined pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Notification Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['info', 'success', 'warning', 'error'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type })}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.type === type
                              ? 'border-[#137fec] bg-[#137fec]/5 text-[#137fec] ring-1 ring-[#137fec]'
                              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                          <span className="material-symbols-outlined mb-1">
                            {type === 'info' && 'info'}
                            {type === 'success' && 'check_circle'}
                            {type === 'warning' && 'warning'}
                            {type === 'error' && 'error'}
                          </span>
                          <span className="text-xs font-bold uppercase">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Office Maintenance Update"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Message Content</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Write your message here..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none transition-all resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#137fec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        Send Notification
                      </>
                    )}
                  </button>

                </form>
              </div>
            </div>
          </div>

        </main>
      </div>
    </SuperAuthGuard>
  );
}
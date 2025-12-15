import { useEffect, useState } from "react";
// Adjust path to your supabase client (located at ../.. /supabase)
import { supabase } from "../../supabase/supabase";
// Adjust path to your AuthGuard (located in ../Auth)
import SuperAuthGuard from "../Auth/SuperAuthGuard";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    lateArrivals: 0,
  });

  // --- 1. Load Fonts & Configure Tailwind (CRITICAL FIX) ---
  useEffect(() => {
    // A. Inject Google Fonts (Inter & Material Symbols) to fix broken icons
    const linkId = 'admin-dashboard-fonts';
    if (!document.getElementById(linkId)) {
      const link1 = document.createElement('link');
      link1.id = linkId;
      link1.rel = 'stylesheet';
      link1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap';
      document.head.appendChild(link1);
    }

    // B. Configure Tailwind for Custom Colors
    if (window.tailwind) {
      window.tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: "#135bec",
              "primary-hover": "#0e4bce",
              "background-light": "#f6f6f8",
            },
            fontFamily: { display: ["Inter", "sans-serif"] },
            boxShadow: {
              soft: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
              glow: "0 0 15px rgba(19, 91, 236, 0.15)",
            },
          },
        },
      };
    }
  }, []);

  // --- 2. Data Fetching ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // Fetch Counts & Logs
      const { count: totalEmp } = await supabase.from("employees").select("*", { count: "exact", head: true });
      const { data: logs, error } = await supabase
        .from("attendance")
        .select(`*, employees (full_name, employee_code, role, department, avatar_url)`)
        .eq("date", today)
        .order("check_in_time", { ascending: false });
        
      if (error) throw error;

      const { count: leaveCount } = await supabase.from("leaves").select("*", { count: "exact", head: true }).eq("date", today).eq("status", "approved");

      // Calculate Derived Stats
      const presentCount = logs ? logs.length : 0;
      const lateCount = logs ? logs.filter((log) => log.status === "Late").length : 0;

      setStats({
        totalEmployees: totalEmp || 0,
        presentToday: presentCount,
        onLeave: leaveCount || 0,
        lateArrivals: lateCount,
      });
      setAttendanceLogs(logs || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- Helpers ---
  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // Badge Styles
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "late") return "bg-red-50 text-red-600 border border-red-100";
    if (s === "on time" || s === "present") return "bg-green-50 text-green-600 border border-green-100";
    if (s === "absent") return "bg-gray-100 text-gray-600 border border-gray-200";
    return "bg-blue-50 text-blue-600 border border-blue-100";
  };

  const getDeptBadge = (dept) => {
    const map = {
      Engineering: "bg-blue-50 text-blue-700",
      Product: "bg-purple-50 text-purple-700",
      Sales: "bg-indigo-50 text-indigo-700",
      "Human Resources": "bg-pink-50 text-pink-700",
      Finance: "bg-yellow-50 text-yellow-800",
    };
    return map[dept] || "bg-gray-50 text-gray-600";
  };

  return (
    <SuperAuthGuard>
      {/* Inline CSS for specific scrollbar and active link styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: 'Inter', sans-serif; background-color: #f6f6f8; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .sidebar-link { position: relative; transition: all 0.2s; }
        .sidebar-link:hover { background-color: #f3f4f6; color: #111318; }
        .sidebar-link.active { background-color: #eff6ff; color: #135bec; }
        .sidebar-link.active .material-symbols-outlined { font-variation-settings: 'FILL' 1; }
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />

      <div className="flex h-screen w-full overflow-hidden bg-background-light text-[#111318]">
        
        {/* --- SIDEBAR (Fixed Width) --- */}
        <aside className="hidden w-64 flex-col border-r border-[#dbdfe6] bg-white md:flex shrink-0 z-20 shadow-sm h-full">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center gap-3 border-b border-[#f0f2f4] px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-md">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[#111318]">HR Portal</h1>
          </div>

          {/* Navigation */}
          <div className="flex flex-col justify-between flex-1 overflow-y-auto p-4">
            <nav className="flex flex-col gap-1">
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-2">Menu</p>
              
              <a className="sidebar-link active flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium" href="#">
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Dashboard
              </a>
              <Link
            to="/super/dashboard/employees"
             className="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#616f89]" href="#">
                <span className="material-symbols-outlined text-[20px]">group</span>
                All Employees
              </Link>
              <a className="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#616f89]" href="#">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
                Attendance
              </a>
              <Link 
              to="/super/dashboard/leaves"
               className="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#616f89]" href="#">
                <span className="material-symbols-outlined text-[20px]">event_busy</span>
                Leave Requests
              </Link>
            </nav>

            <div className="flex flex-col border-t border-[#f0f2f4] pt-4 mt-2">
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">System</p>
              <a className="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#616f89]" href="#">
                <span className="material-symbols-outlined text-[20px]">settings</span>
                Settings
              </a>
              <a className="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#616f89] hover:!text-red-600 hover:!bg-red-50" href="#">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </a>

              {/* User Profile */}
              <div className="flex items-center gap-3 px-3 py-3 mt-4 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                <Link to="/super/dashboard/profile">
                <img className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt3aqhAYEAD9pkJ4PQUpdNM3ADFjvo2iBXN0VLUyoaCaj0JFcUozXIHBP-6ggsrSn-VZGhcmLHdPbAjkMhZWwTKykBWjNVbCYDBsiXlWz6Npryo_l_bmW7CmEvJ_gq4jq6oCRs5E7dZaILv0rexKsNQjsl3-KqwNlu7gQxmpIXOpuBf7H1AR1-pSladZKNzJmoPPZLOxkwFA8BFD2YOhyJDZUQe9DxcWINVMGK_G7p49M36yV4lqh1rkoH1wxFqlZvXmeOkeWSmWc" alt="User" />
                <div className="flex flex-col overflow-hidden">
                  <p className="text-sm font-bold text-[#111318] truncate">Jane Admin</p>
                  <p className="text-xs text-[#616f89] truncate">HR Manager</p>
                </div>
                </Link>
                <span className="material-symbols-outlined ml-auto text-gray-400 text-[18px]">expand_more</span>
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          
          {/* Top Header */}
          <header className="flex h-16 items-center justify-between border-b border-[#dbdfe6] bg-white px-6 sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-[#111318]">Dashboard Overview</h2>
              <p className="text-xs text-[#616f89] hidden sm:block">Welcome back, here's what's happening today.</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar - Fixed Width to prevent crushing */}
              <div className="hidden md:flex relative w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-[20px]">search</span>
                <input 
                  type="text" 
                  placeholder="Search employees, records..." 
                  className="w-full rounded-full bg-[#f0f2f4] pl-10 pr-4 py-2 text-sm text-[#111318] placeholder-[#616f89] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                />
              </div>

              {/* Actions */}
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#dbdfe6] text-[#616f89] hover:bg-gray-50 transition-all">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <button className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-white hover:bg-primary-hover shadow-md transition-all">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="text-sm font-medium">Add Employee</span>
              </button>
            </div>
          </header>

          {/* Scrollable Body */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-8">
              
              {/* Stats Grid */}
              <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* Card 1 */}
                <div className="flex flex-col justify-between rounded-xl border border-[#dbdfe6] bg-white p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-[#616f89]">Total Employees</p>
                      <h3 className="text-3xl font-bold text-[#111318] mt-2">{loading ? "-" : stats.totalEmployees}</h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <span className="material-symbols-outlined">group</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    <span>+2 this week</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="flex flex-col justify-between rounded-xl border border-[#dbdfe6] bg-white p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-[#616f89]">Present Today</p>
                      <h3 className="text-3xl font-bold text-[#111318] mt-2">{loading ? "-" : stats.presentToday}</h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#616f89] bg-gray-50 w-fit px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[14px] text-green-600">pie_chart</span>
                    <span>90% attendance rate</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="flex flex-col justify-between rounded-xl border border-[#dbdfe6] bg-white p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-[#616f89]">On Leave</p>
                      <h3 className="text-3xl font-bold text-[#111318] mt-2">{loading ? "-" : stats.onLeave}</h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                      <span className="material-symbols-outlined">beach_access</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[14px]">pending</span>
                    <span>4 pending approval</span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="flex flex-col justify-between rounded-xl border border-[#dbdfe6] bg-white p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-[#616f89]">Late Arrivals</p>
                      <h3 className="text-3xl font-bold text-[#111318] mt-2">{loading ? "-" : stats.lateArrivals}</h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <span className="material-symbols-outlined">schedule_send</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 w-fit px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[14px]">priority_high</span>
                    <span>Needs review</span>
                  </div>
                </div>
              </section>

              {/* Table Section */}
              <section className="rounded-xl border border-[#dbdfe6] bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0f2f4] px-6 py-5">
                  <div>
                    <h2 className="text-lg font-bold text-[#111318]">Today's Attendance Log</h2>
                    <p className="text-sm text-[#616f89]">Real-time tracking of employee check-ins</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-[#dbdfe6] bg-white px-3 py-2 text-sm font-medium text-[#616f89] hover:bg-gray-50 transition-all">
                      <span className="material-symbols-outlined text-[18px]">filter_list</span>
                      Filter
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-[#dbdfe6] bg-white px-3 py-2 text-sm font-medium text-[#616f89] hover:bg-gray-50 transition-all">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Export
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] border-b border-[#f0f2f4]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#616f89]">Employee</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#616f89]">Role</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#616f89]">Department</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#616f89]">Check-in</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#616f89]">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#616f89]">Check-out</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#616f89] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f4]">
                      {loading ? (
                         <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                      ) : attendanceLogs.length === 0 ? (
                        <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No attendance records found for today.</td></tr>
                      ) : (
                        attendanceLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#fcfcfd] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img 
                                  className="h-9 w-9 rounded-full object-cover" 
                                  src={log.employees?.avatar_url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
                                  alt="Profile" 
                                />
                                <div>
                                  <p className="text-sm font-semibold text-[#111318]">{log.employees?.full_name}</p>
                                  <p className="text-xs text-[#616f89]">{log.employees?.employee_code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#111318]">{log.employees?.role}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getDeptBadge(log.employees?.department)}`}>
                                {log.employees?.department}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#111318]">{formatTime(log.check_in_time)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(log.status)}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'Late' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#616f89]">{log.check_out_time ? formatTime(log.check_out_time) : '--:--'}</td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-[#616f89] hover:text-[#111318] p-1 rounded-full hover:bg-gray-100">
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-[#f0f2f4] px-6 py-4">
                  <p className="text-sm text-[#616f89]">Showing 1 to {attendanceLogs.length} of {attendanceLogs.length} entries</p>
                  <div className="flex gap-2">
                    <button className="h-8 w-8 flex items-center justify-center rounded border border-[#dbdfe6] text-[#616f89] hover:bg-gray-50"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                    <button className="h-8 w-8 flex items-center justify-center rounded bg-primary text-white text-sm">1</button>
                    <button className="h-8 w-8 flex items-center justify-center rounded border border-[#dbdfe6] text-[#616f89] hover:bg-gray-50 text-sm">2</button>
                    <button className="h-8 w-8 flex items-center justify-center rounded border border-[#dbdfe6] text-[#616f89] hover:bg-gray-50"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </SuperAuthGuard>
  );
}
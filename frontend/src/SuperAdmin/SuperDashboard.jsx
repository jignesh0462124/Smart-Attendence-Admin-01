import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  LogOut,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Search
} from "lucide-react";

import SuperAuthGuard from "../Auth/SuperAuthGuard";
// Assuming these helper functions exist in your 'super.js' file
import {
  getSuperAdminProfile,
  fetchAttendanceByMonth,
  superLogout,
} from "./super";

export default function SuperDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // To highlight active sidebar link

  const [loading, setLoading] = useState(true);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  // Stats State
  const [stats, setStats] = useState({
    totalRecords: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  });

  /* ================= LOAD DASHBOARD ================= */
  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      // 1️⃣ Verify Super Admin
      const admin = await getSuperAdminProfile();
      if (!admin) throw new Error("Unauthorized");
      setSuperAdmin(admin);

      // 2️⃣ Fetch current month attendance
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const records = await fetchAttendanceByMonth(year, month);
      setAttendanceLogs(records || []);

      // 3️⃣ Calculate Today's Stats
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = (records || []).filter((r) => r.date === today);

      setStats({
        totalRecords: todayRecords.length, // Changed to show TODAY'S total count
        presentToday: todayRecords.filter((r) => r.status === "Present").length,
        lateToday: todayRecords.filter((r) => r.status === "Late").length,
        absentToday: todayRecords.filter((r) => r.status === "Absent").length,
      });

    } catch (err) {
      console.error("Dashboard Load Error:", err);
      navigate("/login"); // Redirect if unauthorized
    } finally {
      setLoading(false);
    }
  }

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      await superLogout();
      navigate("/login");
    }
  };

  /* ================= HELPERS ================= */
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "--:--";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present": return "bg-green-100 text-green-700 border-green-200";
      case "Late": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Absent": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  /* ================= UI ================= */
  return (
    <SuperAuthGuard>
      <div className="bg-background-light text-slate-900 h-screen flex overflow-hidden selection:bg-[#137fec]/20">

        {/* Mobile Sidebar Toggle Input (Hidden) */}
        <input className="peer hidden" id="sidebar-toggle" type="checkbox" />
        <label aria-hidden="true" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 hidden peer-checked:block md:hidden transition-opacity" htmlFor="sidebar-toggle"></label>

        {/* --- SIDEBAR --- */}
        <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 transform -translate-x-full peer-checked:translate-x-0 md:translate-x-0 md:static md:flex shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">

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

            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#137fec]/10 text-[#137fec] group border-l-4 border-[#137fec] shadow-sm" to="/super/dashboard">
              <span className="material-symbols-outlined fill-1">dashboard</span>
              <span className="text-sm font-semibold">Dashboard</span>
            </Link>

            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" to="/super/dashboard/employees">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">group</span>
              <span className="text-sm font-medium">Employees</span>
            </Link>

            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" to="/super/dashboard/leaves">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">assignment</span>
              <span className="text-sm font-medium">Leave Requests</span>
            </Link>

            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" to="/super/dashboard/notification">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">notifications</span>
              <span className="text-sm font-medium">Notifications</span>
            </Link>

            <div className="px-3 mt-6 mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System</p>
            </div>

            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" to="/super/dashboard/profile">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">person</span>
              <span className="text-sm font-medium">My Profile</span>
            </Link>

            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <img alt="Admin user avatar" className="h-9 w-9 rounded-full object-cover border border-slate-200 ring-2 ring-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkBj1dKTKjTO5eqPsXYyb3FAT3QY4QokWXoqFuOJJqNqfBJz4gdTyBmS7KNRF4b4IbrYu8sLF33o3Ur_zvMv0Uf0CK6VTWWxHXPruV4OWKMiJoeo-5KiJ48ClrhpQSM7fWf-FKLMU9_UbyyoDaM5f3JZDrp0uzy3WniSSKIxkps2Doww24baOhXtMkHNGM31qSmFdvAmdpNFv5dSvJWflIcjgyUpGJDEwik4TvwVcPAYPwIBnRl2FPiPfaikqIMBSwNDdXaWUbrXU" />
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-slate-700">Admin User</p>
                <p className="text-xs text-slate-500">admin@company.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative">

          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
            <div className="flex items-center gap-4">
              <label className="p-2 -ml-2 text-slate-500 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 cursor-pointer md:hidden" htmlFor="sidebar-toggle">
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </label>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  Dashboard
                </h2>
                <p className="text-xs text-slate-500">Welcome back, {superAdmin?.full_name?.split(" ")[0] || "Admin"}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">
                {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Today's Check-ins" value={stats.totalRecords} icon="group" color="text-blue-600" bg="bg-blue-50" />
                <StatCard title="Present" value={stats.presentToday} icon="check_circle" color="text-green-600" bg="bg-green-50" />
                <StatCard title="Late" value={stats.lateToday} icon="schedule" color="text-yellow-600" bg="bg-yellow-50" />
                <StatCard title="Absent" value={stats.absentToday} icon="cancel" color="text-red-600" bg="bg-red-50" />
              </div>

              {/* TABLE SECTION */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500">sensors</span>
                    Live Attendance Feed
                  </h3>
                  <div className="relative hidden sm:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input type="text" placeholder="Search employee..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137fec] w-64 transition-all" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Check In</th>
                        <th className="px-6 py-4">Check Out</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-16 mx-auto"></div></td>
                          </tr>
                        ))
                      ) : attendanceLogs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <span className="material-symbols-outlined text-4xl text-slate-200">calendar_today</span>
                              <p>No attendance records found for today.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        attendanceLogs
                          .slice(0, 50) // Limit display
                          .map((log) => (
                            <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {log.profile_image ? (
                                    <img src={log.profile_image} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm" alt="" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                                      {log.full_name ? log.full_name.charAt(0) : "U"}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-slate-900">{log.full_name || "Unknown"}</p>
                                    <p className="text-xs text-slate-400">{log.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-600 text-xs">
                                {formatTime(log.check_in)}
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-600 text-xs">
                                {log.check_out ? formatTime(log.check_out) : <span className="text-slate-300">--:--</span>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(log.status)}`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </SuperAuthGuard>
  );
}

/* ================= SUB-COMPONENTS ================= */

function SidebarItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${active
        ? "bg-indigo-50 text-indigo-700 shadow-sm"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`h-12 w-12 rounded-lg ${bg} flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
    </div>
  );
}
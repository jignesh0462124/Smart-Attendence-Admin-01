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
  const formatTime = (time) => {
    if (!time) return "--:--";
    // Dummy date to parse time string
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
      <div className="min-h-screen bg-slate-50 flex font-sans">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              AdminPanel
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <SidebarItem 
              to="/super/dashboard" 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={true} // Hardcoded active for this page
            />
            <SidebarItem 
              to="/super/attendance" 
              icon={<Calendar size={20} />} 
              label="All Attendance" 
              active={false}
            />
            <SidebarItem 
              to="/super/users" 
              icon={<Users size={20} />} 
              label="Employees" 
              active={false}
            />
            <SidebarItem 
              to="/super/profile" 
              icon={<UserCircle size={20} />} 
              label="My Profile" 
              active={false}
            />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          {/* HEADER SECTION */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Welcome back, {superAdmin?.name?.split(" ")[0] || "Admin"} 👋
              </h2>
              <p className="text-slate-500 mt-1">Here is today's attendance overview.</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">
                {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </header>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Today's Check-ins" 
              value={stats.totalRecords} 
              icon={<Users className="text-blue-600" size={24} />}
              color="bg-blue-50"
            />
            <StatCard 
              title="Present" 
              value={stats.presentToday} 
              icon={<CheckCircle className="text-green-600" size={24} />}
              color="bg-green-50"
            />
            <StatCard 
              title="Late" 
              value={stats.lateToday} 
              icon={<Clock className="text-yellow-600" size={24} />}
              color="bg-yellow-50"
            />
            <StatCard 
              title="Absent" 
              value={stats.absentToday} 
              icon={<XCircle className="text-red-600" size={24} />}
              color="bg-red-50"
            />
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Live Attendance Feed</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
                <input 
                  type="text" 
                  placeholder="Search employee..." 
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Check In</th>
                    <th className="px-6 py-4">Check Out</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    // LOADING SKELETON
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-16 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                           <Calendar className="w-10 h-10 text-slate-300"/>
                           <p>No attendance records found for today.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // DATA ROWS
                    attendanceLogs
                      .filter(a => a.date === new Date().toISOString().split("T")[0])
                      .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {log.full_name ? log.full_name.charAt(0) : "U"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{log.full_name || "Unknown"}</p>
                              <p className="text-xs text-slate-400">{log.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                          {formatTime(log.check_in_time)}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                           {log.check_out_time ? formatTime(log.check_out_time) : <span className="text-slate-300">--:--</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
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
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
        active 
          ? "bg-indigo-50 text-indigo-700 shadow-sm" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
      </div>
    </div>
  );
}
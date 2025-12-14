import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Search, Users, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import {
  fetchAttendanceByMonth,
  getSuperAdminProfile,
} from "./super";

export default function SuperDashboard() {
  const navigate = useNavigate();
  const today = new Date();

  // State
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Verify Super Admin
      await getSuperAdminProfile();

      // 2️⃣ Fetch attendance
      const data = await fetchAttendanceByMonth(year, month);
      setAttendance(data);
    } catch (err) {
      console.error("SuperDashboard error:", err);
      setError(err.message || "Failed to load attendance");

      if (err.message?.includes("Access denied")) {
        navigate("/super/login");
      }
    } finally {
      setLoading(false);
    }
  }

  // --- Helpers & Logic ---

  // Filter attendance based on search
  const filteredAttendance = useMemo(() => {
    return attendance.filter((row) =>
      row.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attendance, searchTerm]);

  // Calculate Summary Stats
  const stats = useMemo(() => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter((r) => r.status === "Present").length;
    const late = filteredAttendance.filter((r) => r.status === "Late").length;
    const absent = filteredAttendance.filter((r) => r.status === "Absent").length;
    return { total, present, late, absent };
  }, [filteredAttendance]);

  // Export to CSV
  const handleExport = () => {
    if (attendance.length === 0) return;
    
    const headers = ["Date", "Name", "Email", "Status", "Check In", "Check Out"];
    const csvContent = [
      headers.join(","),
      ...filteredAttendance.map(row => 
        `${row.date},"${row.full_name}",${row.email},${row.status},${row.check_in_time || "-"},${row.check_out_time || "-"}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_report_${year}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate dynamic year list (Current year - 2 to Current year + 1)
  const years = Array.from({ length: 4 }, (_, i) => today.getFullYear() - 2 + i);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Attendance</h1>
            <p className="text-gray-500 mt-1">Super Admin Dashboard</p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading || attendance.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users className="text-blue-600" />} label="Total Records" value={stats.total} color="bg-blue-50" />
          <StatCard icon={<CheckCircle className="text-green-600" />} label="Present" value={stats.present} color="bg-green-50" />
          <StatCard icon={<Clock className="text-yellow-600" />} label="Late" value={stats.late} color="bg-yellow-50" />
          <StatCard icon={<XCircle className="text-red-600" />} label="Absent" value={stats.absent} color="bg-red-50" />
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search employee by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Date Filters */}
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 mb-6 border border-red-200">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">
              Loading attendance data...
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No records found for the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Check In</th>
                    <th className="px-6 py-4">Check Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendance.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {row.date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{row.full_name}</span>
                          <span className="text-xs text-gray-500">{row.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {row.check_in_time ? (
                          <span className="bg-gray-100 px-2 py-1 rounded">{row.check_in_time}</span>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {row.check_out_time ? (
                          <span className="bg-gray-100 px-2 py-1 rounded">{row.check_out_time}</span>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Footer / Pagination Placeholder */}
          {!loading && filteredAttendance.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-end">
              Showing {filteredAttendance.length} records
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components for cleaner code ---

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Present: "bg-green-100 text-green-700 border-green-200",
    Late: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Absent: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-700 border-gray-200"
  };

  const currentStyle = styles[status] || styles.default;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${currentStyle}`}>
      {status}
    </span>
  );
}
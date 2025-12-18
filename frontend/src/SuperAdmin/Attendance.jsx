import React, { useEffect, useState } from "react";
// Adjust these paths to match your actual folder structure
import SuperAuthGuard from "../Auth/SuperAuthGuard";
// helper functions live in the same folder (`src/SuperAdmin/super.js`)
import { fetchAttendanceByMonth } from "./super";
import Sidebar from "../components/Sidebar"; 

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    rate: 96, // Default fallback
    late: 12,
    absent: 4,
    total: 0
  });

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // --- 1. Fetch Data ---
  useEffect(() => {
    loadAttendanceData();
  }, []);

  async function loadAttendanceData() {
    try {
      setLoading(true);
      const now = new Date();
      // Fetching data for the current month
      const data = await fetchAttendanceByMonth(now.getFullYear(), now.getMonth() + 1);
      
      if (data) {
        setAttendanceData(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    if (!data.length) return;

    const total = data.length;
    const late = data.filter(r => r.status === 'Late').length;
    const absent = data.filter(r => r.status === 'Absent').length;
    const onTime = data.filter(r => r.status === 'On Time').length;
    
    // Calculate rate (Present / Total)
    const rate = total > 0 ? Math.round(((onTime + late) / total) * 100) : 0;

    setStats({
      rate,
      late,
      absent,
      total
    });
  }

  // --- 2. Filtering Logic ---
  const filteredData = attendanceData.filter(item => {
    // Search by Name or ID
    const matchesSearch = 
      (item.employee_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (item.employee_id?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    // Filter by Department
    const matchesDept = departmentFilter ? item.department === departmentFilter : true;
    
    return matchesSearch && matchesDept;
  });

  // --- 3. UI Helper for Status Badges ---
  const getStatusBadge = (status) => {
    switch(status) {
      case 'On Time':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> On Time
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Late
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Absent
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> On Leave
          </span>
        );
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <SuperAuthGuard>
      {/* Styles Injection */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { font-family: 'Inter', sans-serif; }
      `}} />

      <div className="flex h-screen w-full relative bg-[#f8fafc] text-[#1e293b] font-sans overflow-hidden">
        
        {/* --- Sidebar Wrapper --- */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 h-full transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <Sidebar />
        </div>

        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)}></div>
        )}

        {/* --- Main Content --- */}
        <main className="flex-1 h-full overflow-y-auto relative w-full bg-[#f8fafc]">
          
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button className="text-slate-500 hover:text-slate-900" onClick={() => setMobileSidebarOpen(true)}>
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
              <h1 className="text-lg font-bold text-slate-900">Attendance History</h1>
            </div>
            {/* User Profile Pic Placeholder */}
            <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 shadow-sm ring-1 ring-slate-200" style={{backgroundImage: 'url("https://ui-avatars.com/api/?name=Admin")'}}></div>
          </div>

          <div className="w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 pb-20">
            
            {/* Breadcrumb */}
            <nav className="hidden md:flex flex-wrap gap-2 items-center text-sm">
              <a className="text-slate-500 font-medium hover:text-[#2563eb] transition-colors" href="#">Dashboard</a>
              <span className="text-slate-400">/</span>
              <a className="text-slate-500 font-medium hover:text-[#2563eb] transition-colors" href="#">Attendance</a>
              <span className="text-slate-400">/</span>
              <span className="text-slate-900 font-semibold">History</span>
            </nav>

            {/* Title Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <h1 className="hidden md:block text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Attendance History</h1>
                <p className="text-slate-500 text-sm md:text-base">Monitor employee check-ins, work hours, and attendance trends.</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Card 1: Rate */}
              <div className="flex flex-col gap-2 p-5 rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Attendance Rate</p>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <span className="material-symbols-outlined text-green-600 text-[20px]">trending_up</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-slate-900 text-3xl font-bold">{loading ? "..." : `${stats.rate}%`}</p>
                  <p className="text-green-600 text-sm font-medium flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span> 2.4%
                  </p>
                </div>
              </div>

              {/* Card 2: Late */}
              <div className="flex flex-col gap-2 p-5 rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Late Arrivals</p>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <span className="material-symbols-outlined text-orange-600 text-[20px]">schedule</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-slate-900 text-3xl font-bold">{loading ? "..." : stats.late}</p>
                  <p className="text-green-600 text-sm font-medium flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span> 5%
                  </p>
                </div>
              </div>

              {/* Card 3: Absences */}
              <div className="flex flex-col gap-2 p-5 rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Absences</p>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <span className="material-symbols-outlined text-red-600 text-[20px]">person_off</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-slate-900 text-3xl font-bold">{loading ? "..." : stats.absent}</p>
                  <p className="text-red-600 text-sm font-medium flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span> 1%
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full xl:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-72 group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors group-focus-within:text-[#2563eb]">
                    <span className="material-symbols-outlined text-slate-400 text-[22px]">search</span>
                  </div>
                  <input 
                    type="text"
                    placeholder="Search by name, ID..." 
                    className="block w-full py-2.5 pl-11 pr-4 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] placeholder-slate-400 transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Date Dropdown */}
                <div className="relative w-full sm:w-48">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                  </div>
                  <select className="block w-full py-2.5 pl-10 pr-8 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] cursor-pointer appearance-none transition-all hover:bg-slate-100 outline-none">
                    <option>Last 30 Days</option>
                    <option>This Week</option>
                    <option>Today</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
                  </div>
                </div>

                {/* Department Dropdown */}
                <div className="relative w-full sm:w-48">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">domain</span>
                  </div>
                  <select 
                    className="block w-full py-2.5 pl-10 pr-8 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] cursor-pointer appearance-none transition-all hover:bg-slate-100 outline-none"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200">
                <label className="cursor-pointer flex-1 sm:flex-none min-w-[100px]">
                  <input type="radio" name="view_mode" value="list" className="peer sr-only" defaultChecked />
                  <div className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 peer-checked:bg-white peer-checked:text-[#2563eb] peer-checked:shadow-sm transition-all flex items-center justify-center gap-2 h-full">
                    <span className="material-symbols-outlined text-[20px]">table_rows</span>
                    <span>List</span>
                  </div>
                </label>
                <label className="cursor-pointer flex-1 sm:flex-none min-w-[100px]">
                  <input type="radio" name="view_mode" value="calendar" className="peer sr-only" />
                  <div className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 peer-checked:bg-white peer-checked:text-[#2563eb] peer-checked:shadow-sm transition-all flex items-center justify-center gap-2 h-full">
                    <span className="material-symbols-outlined text-[20px]">calendar_view_month</span>
                    <span>Calendar</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap sticky top-0 bg-slate-50 z-10">Employee</th>
                      <th className="px-6 py-4 whitespace-nowrap sticky top-0 bg-slate-50 z-10">Date</th>
                      <th className="px-6 py-4 whitespace-nowrap sticky top-0 bg-slate-50 z-10">Check In</th>
                      <th className="px-6 py-4 whitespace-nowrap sticky top-0 bg-slate-50 z-10">Check Out</th>
                      <th className="px-6 py-4 whitespace-nowrap sticky top-0 bg-slate-50 z-10">Work Hours</th>
                      <th className="px-6 py-4 whitespace-nowrap sticky top-0 bg-slate-50 z-10">Status</th>
                      <th className="px-6 py-4 whitespace-nowrap sticky top-0 bg-slate-50 z-10 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading records...</td></tr>
                    ) : filteredData.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-500">No attendance records found.</td></tr>
                    ) : (
                      filteredData.map((row, index) => (
                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div 
                                className="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-white shadow-sm" 
                                style={{backgroundImage: `url("${row.avatar_url || 'https://ui-avatars.com/api/?name=' + row.employee_name}")`}}
                              ></div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{row.employee_name}</span>
                                <span className="text-xs text-slate-500">{row.department}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">{row.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">{row.check_in || '--:--'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">{row.check_out || '--:--'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">{row.work_hours || '--'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(row.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button className="text-slate-400 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Rows per page:</span>
                  <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-[#2563eb] focus:border-[#2563eb] block p-1.5 outline-none">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm text-slate-600">{`1-${Math.min(5, filteredData.length)} of ${filteredData.length}`}</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#2563eb] disabled:opacity-50 transition-colors">Previous</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-white bg-[#2563eb] rounded-lg shadow-sm hover:bg-[#1d4ed8] transition-colors">1</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#2563eb] transition-colors">2</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#2563eb] transition-colors">Next</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </SuperAuthGuard>
  );
}
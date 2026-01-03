import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Adjust path to your AuthGuard
import SuperAuthGuard from "../Auth/SuperAuthGuard";
import { fetchAllEmployees, superLogout } from "./super";
import AddEmployeeModal from "./AddEmployeeModal";

/**
 * Renders the All Employees List page for the HR Admin portal in a strict Light Theme.
 * Fetches employee list and summary statistics from Supabase.
 */
export default function EmployeeList() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await superLogout();
      navigate("/super/login");
    }
  };
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Modal State
  const [stats, setStats] = useState({
    totalEmployees: 0,
    active: 0,
    onLeave: 0,
    newThisMonth: 0,
  });

  // --- Utility Functions ---

  // Function to map department string to Tailwind badge classes
  const getDeptBadgeColor = (dept) => {
    switch (dept) {
      case "Engineering": return "bg-blue-400";
      case "Design": return "bg-pink-400";
      case "Marketing": return "bg-pink-400";
      case "Human Resources": return "bg-indigo-400";
      case "Product": return "bg-purple-400";
      default: return "bg-slate-400";
    }
  };

  // Function to map status string to Tailwind badge classes
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "active") return "bg-green-50 text-green-700 border border-green-200";
    if (s === "on leave") return "bg-orange-50 text-orange-700 border border-orange-200";
    if (s === "inactive") return "bg-slate-100 text-slate-600 border border-slate-200";
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

  // Function to determine online status circle color based on a mock status
  const getOnlineStatusColor = (id) => {
    if (id % 4 === 0) return "bg-green-400";
    if (id % 5 === 0) return "bg-orange-400";
    return "bg-green-400";
  };

  // --- Data Fetching ---

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  async function fetchEmployeeData() {
    try {
      setLoading(true);

      // 1. Fetch all profiles from Supabase using centralized helper
      const data = await fetchAllEmployees();

      // 2. Compute Stats
      const totalEmployees = data.length;
      // Since we don't have a specific 'status' column in the schema yet, 
      // we'll assume everyone is 'Active' for now, or you could add logic 
      // to check their last attendance date.
      const active = data.length;
      const onLeave = 0; // TODO: Fetch from 'leaves' table where status='Approved' and date=today

      // Calculate new this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newThisMonth = data.filter(p => new Date(p.created_at) >= startOfMonth).length;

      setStats({
        totalEmployees,
        active,
        onLeave,
        newThisMonth,
      });

      // 3. Map Supabase data to the UI format
      const mappedEmployees = data.map(p => ({
        id: p.id,
        full_name: p.full_name || "N/A",
        email: p.email || "N/A",
        employee_code: "#EMP-" + (p.id ? p.id.substring(0, 4).toUpperCase() : "0000"), // Generate pseudo-ID or add column later
        role: p.role || "Employee",
        sub_role: "General", // Placeholder
        department: "General", // Placeholder as 'department' is not in schema yet
        status: "Active", // Placeholder
        avatar_url: p.profile_image
      }));

      setEmployees(mappedEmployees);

    } catch (err) {
      console.error("Error fetching employee data:", err);
      // Fallback empty or alert
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }

  // Refresh list after adding
  const handleUserAdded = () => {
    fetchEmployeeData();
  };

  // --- Render Logic ---
  return (
    <SuperAuthGuard>
      {/* INJECTED STYLES: 
        1. Set the primary color variable (primary: #137fec).
        2. Set background color variable (background-light: #f0f4f9).
        3. Remove dark mode scrollbar styling to ensure light-only appearance.
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Custom scrollbar matching the original HTML */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* Set base font and ensure light background */
        body { font-family: 'Inter', sans-serif; }
        .bg-background-light { background-color: #f0f4f9; }
        .text-primary { color: #137fec; }
        .border-primary { border-color: #137fec; }
      `}} />

      {/* Main Layout Container: Removed dark: classes */}
      <div className="bg-background-light text-slate-900 h-screen flex overflow-hidden selection:bg-[#137fec]/20">

        {/* Mobile Sidebar Toggle Input (Hidden) */}
        <input className="peer hidden" id="sidebar-toggle" type="checkbox" />
        <label aria-hidden="true" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 hidden peer-checked:block md:hidden transition-opacity" htmlFor="sidebar-toggle"></label>

        {/* --- SIDEBAR --- */}
        <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 transform -translate-x-full peer-checked:translate-x-0 md:translate-x-0 md:static md:flex shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">

          {/* Sidebar Header/Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2 text-[#137fec] font-bold text-xl tracking-tight">
              <span className="material-symbols-outlined filled">hexagon</span>
              HR Admin
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
            <div className="px-3 mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Main</p>
            </div>
            {/* Dashboard Link */}
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" to="/super/dashboard">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            {/* Employees Link (Active) */}
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#137fec]/10 text-[#137fec] group border-l-4 border-[#137fec] shadow-sm" to="/super/dashboard/employees">
              <span className="material-symbols-outlined fill-1">group</span>
              <span className="text-sm font-semibold">Employees</span>
            </Link>
            {/* Other Nav Links */}
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" to="/super/dashboard/leaves">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">assignment</span>
              <span className="text-sm font-medium">Leave Requests</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" to="/super/dashboard/notification">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">notifications</span>
              <span className="text-sm font-medium">Notifications</span>
            </Link>

            {/* System Section */}
            <div className="px-3 mt-6 mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System</p>
            </div>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" to="/super/dashboard/profile">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">person</span>
              <span className="text-sm font-medium">My Profile</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group" onClick={handleLogout}>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </nav>

          {/* User Profile */}
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

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative">

          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <label className="p-2 -ml-2 text-slate-500 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 cursor-pointer md:hidden" htmlFor="sidebar-toggle">
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </label>
              {/* Mobile Logo */}
              <div className="md:hidden flex items-center gap-2 text-[#137fec] font-bold text-xl">
                <span className="material-symbols-outlined filled">hexagon</span>
                HR Admin
              </div>
              {/* Breadcrumb Navigation */}
              <nav className="hidden md:flex items-center text-sm font-medium text-slate-500">
                <a className="hover:text-[#137fec] transition-colors flex items-center gap-1" href="#">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  Home
                </a>
                <span className="material-symbols-outlined text-[16px] text-slate-300 mx-1">chevron_right</span>
                <a className="hover:text-[#137fec] transition-colors" href="#">Employees</a>
                <span className="material-symbols-outlined text-[16px] text-slate-300 mx-1">chevron_right</span>
                <span className="text-[#137fec] font-semibold bg-blue-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">List</span>
              </nav>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Quick Search */}
              <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 border border-transparent focus-within:border-[#137fec] focus-within:ring-2 focus-within:ring-[#137fec]/20 transition-all">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                <input className="bg-transparent border-none text-sm ml-2 focus:ring-0 text-slate-600 w-48 placeholder-slate-400" placeholder="Quick search..." type="text" />
              </div>
              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
              {/* Notifications */}
              <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-colors relative group">
                <span className="material-symbols-outlined group-hover:animate-pulse">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm"></span>
              </button>
              {/* Help */}
              <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-colors hidden md:block">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </header>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

              {/* Page Title & Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    All Employees
                    {loading ? (
                      <span className="animate-pulse bg-slate-200 text-transparent text-sm font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">999</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-sm font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                        {stats.totalEmployees}
                      </span>
                    )}
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm md:text-base">Manage your team members and their account permissions.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-[#137fec] transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">file_upload</span>
                    Export
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#137fec] hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add New Employee
                  </button>
                </div>
              </div>

              {/* Add Modal */}
              <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={handleUserAdded}
              />

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Employees Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-[#137fec] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Employees</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "-" : stats.totalEmployees}</p>
                      <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                        <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
                        +2.5% vs last month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#137fec]">
                      <span className="material-symbols-outlined text-[28px]">group</span>
                    </div>
                  </div>
                </div>

                {/* Active Employees Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "-" : stats.active}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">{loading ? "-" : `${Math.round((stats.active / stats.totalEmployees) * 100) || 0}%`} of total</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                      <span className="material-symbols-outlined text-[28px]">check_circle</span>
                    </div>
                  </div>
                </div>

                {/* On Leave Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">On Leave</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "-" : stats.onLeave}</p>
                      <p className="text-xs text-orange-600 font-medium mt-1">4 returning soon</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                      <span className="material-symbols-outlined text-[28px]">beach_access</span>
                    </div>
                  </div>
                </div>

                {/* New This Month Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">New (This Month)</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "-" : stats.newThisMonth}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">Onboarding pending: 2</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                      <span className="material-symbols-outlined text-[28px]">person_add</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10 md:static">
                {/* Search Input: Removed dark: classes */}
                <div className="md:col-span-5 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#137fec] transition-colors text-[20px]">search</span>
                  </div>
                  <input className="block w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] focus:bg-white sm:text-sm transition-all shadow-sm" placeholder="Search by name, ID, or email..." type="text" />
                </div>
                {/* Department Filter: Removed dark: classes */}
                <div className="md:col-span-3">
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] rounded-lg bg-slate-50/50 text-slate-900 cursor-pointer hover:bg-white transition-colors shadow-sm">
                      <option>All Departments</option>
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Human Resources</option>
                    </select>
                  </div>
                </div>
                {/* Status Filter: Removed dark: classes */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <select className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] rounded-lg bg-slate-50/50 text-slate-900 cursor-pointer hover:bg-white transition-colors shadow-sm">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>On Leave</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                {/* Filter Actions */}
                <div className="md:col-span-2 flex items-center justify-end md:justify-start lg:justify-end gap-2">
                  <button className="p-2.5 text-slate-400 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="More Filters">
                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  </button>
                  <button className="text-sm text-[#137fec] font-medium hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50/50 transition-colors whitespace-nowrap">Reset Filters</button>
                </div>
              </div>

              {/* Employee Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col relative">
                <div className="overflow-x-auto rounded-t-xl">
                  {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading employee data...</div>
                  ) : employees.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No employees found.</div>
                  ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="sticky top-0 z-10 px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" scope="col">Employee</th>
                          <th className="sticky top-0 z-10 px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" scope="col">ID</th>
                          <th className="sticky top-0 z-10 px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" scope="col">Role</th>
                          <th className="sticky top-0 z-10 px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" scope="col">Department</th>
                          <th className="sticky top-0 z-10 px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" scope="col">Status</th>
                          <th className="sticky top-0 z-10 px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 relative">
                                  {employee.avatar_url && employee.avatar_url.length > 2 ? (
                                    <img alt={employee.full_name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" src={employee.avatar_url} />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold ring-2 ring-white shadow-sm">
                                      {employee.full_name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                  )}
                                  <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${getOnlineStatusColor(employee.id)} ring-2 ring-white`}></span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-slate-900 group-hover:text-[#137fec] transition-colors">{employee.full_name}</div>
                                  <div className="text-xs text-slate-500">{employee.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit text-xs">{employee.employee_code}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-900 font-medium">{employee.role}</div>
                              <div className="text-xs text-slate-500">{employee.sub_role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${getDeptBadgeColor(employee.department)}`}></span>
                                {employee.department}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadge(employee.status)}`}>
                                {employee.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-all" title="View Profile">
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit Details">
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete User">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination: Removed dark: classes */}
                <div className="bg-white px-4 py-4 flex items-center justify-between border-t border-slate-200 rounded-b-xl">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-600">
                        Showing <span className="font-bold text-slate-900">1</span> to <span className="font-bold text-slate-900">{employees.length}</span> of <span className="font-bold text-slate-900">{stats.totalEmployees}</span> results
                      </p>
                    </div>
                    <div>
                      <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                        <a className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors" href="#">
                          <span className="sr-only">Previous</span>
                          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </a>
                        <a aria-current="page" className="z-10 bg-[#137fec]/10 border-[#137fec] text-[#137fec] relative inline-flex items-center px-4 py-2 border text-sm font-bold" href="#">1</a>
                        <a className="bg-white border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-[#137fec] relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors" href="#">2</a>
                        <a className="bg-white border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-[#137fec] relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors" href="#">3</a>
                        <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-slate-50 text-sm font-medium text-slate-500">...</span>
                        <a className="bg-white border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-[#137fec] relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors" href="#">15</a>
                        <a className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors" href="#">
                          <span className="sr-only">Next</span>
                          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </a>
                      </nav>
                    </div>
                  </div>
                  {/* Mobile Pagination */}
                  <div className="sm:hidden flex justify-between w-full">
                    <button className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                      Previous
                    </button>
                    <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="text-center text-xs text-slate-400 pb-4">
                © 2024 HR Admin Dashboard. All rights reserved.
              </footer>
            </div>
          </div>
        </main>

      </div>
    </SuperAuthGuard>
  );
}
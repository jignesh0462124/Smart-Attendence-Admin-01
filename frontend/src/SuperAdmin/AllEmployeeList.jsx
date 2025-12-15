import { useEffect, useState } from "react";
// Adjust path to your supabase client
import { supabase } from "../../supabase/supabase";
// Adjust path to your AuthGuard
import SuperAuthGuard from "../Auth/SuperAuthGuard";

/**
 * Renders the All Employees List page for the HR Admin portal in a strict Light Theme.
 * Fetches employee list and summary statistics from Supabase.
 */
export default function EmployeeList() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
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

  // --- Data Fetching (Kept same as previous response) ---

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  async function fetchEmployeeData() {
    try {
      setLoading(true);
      
      // Fetch data... (mocked for this example)
      const mockTotal = 142;
      const mockActive = 128;
      const mockOnLeave = 12;
      const mockNew = 5;

      setStats({
        totalEmployees: mockTotal,
        active: mockActive,
        onLeave: mockOnLeave,
        newThisMonth: mockNew,
      });

      // Default employee data matching the screenshot/HTML structure
      const defaultEmployees = [
        { id: 1, full_name: "Sarah Jenkins", email: "sarah.j@company.com", employee_code: "#EMP-0042", role: "Senior Designer", sub_role: "Product Team", department: "Marketing", status: "Active", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYFpOZwyiWGzKnY6Ez8NFuBnf4vs_aTa5KmaMMS61Q_ZvyVy_uqmEDLHG3jcMDNSJ0tXGuIzvN4u_eSeocQSO5ELL1VBazpyLJuK_UlR2mVpB-engzUKeVHsWafNMvtv7KgXGd-JmxU4o8MKdbIv967GbtYVBCSin0k17XHNhxEoMo7TUAgp6zBv0gnLo9UkEGUGq_oYgr5U7t_xpCLV3YRSJg8DGiO_SgAjhbvq0oBjjTWdVF265DS-JuAT-Znt3ZMZb0E2ORSH4" },
        { id: 2, full_name: "Michael Chen", email: "m.chen@company.com", employee_code: "#EMP-0045", role: "Full Stack Dev", sub_role: "Engineering", department: "Engineering", status: "Active", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwCb7Oxc0kNHgcsFcslTtwHebX9IQR0Y4SzVpfC17tYMaK9nPSraD1tiomeMzmsqkFt0venXT08W3ZSLL26RvgytZ3rFpiUVeOKIwrLpmQ4LU04Oeajvred0IbJqLWlHQJ5i9POq-qwJxNzR9K2TVwho9t2qgZQ0HqnSWioKXTafK3Iuzh1DAbNw26TRQMRts2oOeBCdlj3oEGS9kBNOuFmccb-iYcBE76S-HraaHRSYi1Xv4zbYxj3F7v4_Qpbnq8dctEDxq2J-s" },
        { id: 3, full_name: "Emily Davis", email: "emily.d@company.com", employee_code: "#EMP-0051", role: "HR Specialist", sub_role: "People Ops", department: "Human Resources", status: "On Leave", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa-Yoyfk4AQ8hd1bYrMLwUzOUboV6jy23kVzSby9gD5KJkTvZfRjnKSOvoabOBZDnC_qOa4-YnAfbnwcRfkhs9pBjR5kZP7myzt8nN2oan4W8g1tk4mHFGc1fpvnoF6QNT4gSAAhRMfK6qfunSSKVBGdQTv57n2sMBr_iKYzX9lwsNF6DVEoV22F5WejdyHMOIySSpoElZ8g2q80_n7It9Y4454kHSBHRmYoiTKlALE03gpdrngn_a41W7T4Y1MZeh2sSV6XH8y_M" },
        { id: 4, full_name: "David Wilson", email: "dwilson@company.com", employee_code: "#EMP-0058", role: "Product Manager", sub_role: "Product Team", department: "Product", status: "Active", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuArUneT3n0dX0ftMPMd26jH0qBCtCRHOd6NSPfXI0E0W7oUetJ5fEUhzdlPEKVlxmx1EN3X_gmApHQ_dpvsdtwSwvjF_cjw_A2Y0jGFkZrLdUytRP2ojdBR4f78BVeZN6xTOlhJ2TDVnR4M2iMH7b7sO0rP_svSspWa1-zhvUVrdftGJFpiEsjNdX-dcgmu9fv7RYdfMfvw39Qkq_LeA5w8wkLLyQMLhbK2telXpUaTZy_KIjQ_BrvGgf8Ok_ygVEvSXRu1aR_hV_U" },
        { id: 5, full_name: "James Rodriguez", email: "j.rod@company.com", employee_code: "#EMP-0063", role: "Frontend Dev", sub_role: "Engineering", department: "Engineering", status: "Inactive", avatar_url: "JR" },
      ];

      setEmployees(defaultEmployees);

    } catch (err) {
      console.error("Error fetching employee data:", err);
      setStats({ totalEmployees: 142, active: 128, onLeave: 12, newThisMonth: 5 });
    } finally {
      setLoading(false);
    }
  }

  // --- Render Logic ---
  return (
    <SuperAuthGuard>
      {/* INJECTED STYLES: 
        1. Set the primary color variable (primary: #137fec).
        2. Set background color variable (background-light: #f0f4f9).
        3. Remove dark mode scrollbar styling to ensure light-only appearance.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
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
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" href="#">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            {/* Employees Link (Active) */}
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#137fec]/10 text-[#137fec] group border-l-4 border-[#137fec] shadow-sm" href="#">
              <span className="material-symbols-outlined fill-1">group</span>
              <span className="text-sm font-semibold">Employees</span>
            </a>
            {/* Other Nav Links */}
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" href="#">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">calendar_month</span>
              <span className="text-sm font-medium">Attendance</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" href="#">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">assignment</span>
              <span className="text-sm font-medium">Leave Requests</span>
            </a>
            
            {/* System Section */}
            <div className="px-3 mt-6 mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System</p>
            </div>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group" href="#">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group" href="#">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </a>
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
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#137fec] hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add New Employee
                  </button>
                </div>
              </div>

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
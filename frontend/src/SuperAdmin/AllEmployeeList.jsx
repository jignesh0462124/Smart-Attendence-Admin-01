import { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabase"; // Adjust path as needed
import SuperAuthGuard from "../Auth/SuperAuthGuard"; // Adjust path as needed
import Sidebar from "../components/Sidebar"; // Your Sidebar Component

/**
 * Renders the All Employees List page for the HR Admin portal.
 * Layout fixed to prevent sidebar overlap.
 */
export default function EmployeeList() {
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    active: 0,
    onLeave: 0,
    newThisMonth: 0,
  });

  // --- Utility Functions ---

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
  
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "active") return "bg-green-50 text-green-700 border border-green-200";
    if (s === "on leave") return "bg-orange-50 text-orange-700 border border-orange-200";
    if (s === "inactive") return "bg-slate-100 text-slate-600 border border-slate-200";
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

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
      
      // Mock Data (Replace with real Supabase query)
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

      const defaultEmployees = [
        { id: 1, full_name: "Sarah Jenkins", email: "sarah.j@company.com", employee_code: "#EMP-0042", role: "Senior Designer", sub_role: "Product Team", department: "Marketing", status: "Active", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYFpOZwyiWGzKnY6Ez8NFuBnf4vs_aTa5KmaMMS61Q_ZvyVy_uqmEDLHG3jcMDNSJ0tXGuIzvN4u_eSeocQSO5ELL1VBazpyLJuK_UlR2mVpB-engzUKeVHsWafNMvtv7KgXGd-JmxU4o8MKdbIv967GbtYVBCSin0k17XHNhxEoMo7TUAgp6zBv0gnLo9UkEGUGq_oYgr5U7t_xpCLV3YRSJg8DGiO_SgAjhbvq0oBjjTWdVF265DS-JuAT-Znt3ZMZb0E2ORSH4" },
        { id: 2, full_name: "Michael Chen", email: "m.chen@company.com", employee_code: "#EMP-0045", role: "Full Stack Dev", sub_role: "Engineering", department: "Engineering", status: "Active", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwCb7Oxc0kNHgcsFcslTtwHebX9IQR0Y4SzVpfC17tYMaK9nPSraD1tiomeMzmsqkFt0venXT08W3ZSLL26RvgytZ3rFpiUVeOKIwrLpmQ4LU04Oeajvred0IbJqLWlHQJ5i9POq-qwJxNzR9K2TVwho9t2qgZQ0HqnSWioKXTafK3Iuzh1DAbNw26TRQMRts2oOeBCdlj3oEGS9kBNOuFmccb-iYcBE76S-HraaHRSYi1Xv4zbYxj3F7v4_Qpbnq8dctEDxq2J-s" },
        { id: 3, full_name: "Emily Davis", email: "emily.d@company.com", employee_code: "#EMP-0051", role: "HR Specialist", sub_role: "People Ops", department: "Human Resources", status: "On Leave", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa-Yoyfk4AQ8hd1bYrMLwUzOUboV6jy23kVzSby9gD5KJkTvZfRjnKSOvoabOBZDnC_qOa4-YnAfbnwcRfkhs9pBjR5kZP7myzt8nN2oan4W8g1tk4mHFGc1fpvnoF6QNT4gSAAhRMfK6qfunSSKVBGdQTv57n2sMBr_iKYzX9lwsNF6DVEoV22F5WejdyHMOIySSpoElZ8g2q80_n7It9Y4454kHSBHRmYoiTKlALE03gpdrngn_a41W7T4Y1MZeh2sSV6XH8y_M" },
        { id: 4, full_name: "David Wilson", email: "dwilson@company.com", employee_code: "#EMP-0058", role: "Product Manager", sub_role: "Product Team", department: "Product", status: "Active", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuArUneT3n0dX0ftMPMd26jH0qBCtCRHOd6NSPfXI0E0W7oUetJ5fEUhzdlPEKVlxmx1EN3X_gmApHQ_dpvsdtwSwvjF_cjw_A2Y0jGFkZrLdUytRP2ojdBR4f78BVeZN6xTOlhJ2TDVnR4M2iMH7b7sO0rP_svSspWa1-zhvUVrdftGJFpiEsjNdX-dcgmu9fv7RYdfMfvw39Qkq_LeA5w8wkLLyQMLhbK2telXpUaTZy_KIjQ_BrvGgf8Ok_ygVEvSXRu1aR_hV_U" },
        { id: 5, full_name: "James Rodriguez", email: "j.rod@company.com", employee_code: "#EMP-0063", role: "Frontend Dev", sub_role: "Engineering", department: "Engineering", status: "Inactive", avatar_url: "" },
      ];

      setEmployees(defaultEmployees);

    } catch (err) {
      console.error("Error fetching employee data:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- Render Logic ---
  return (
    <SuperAuthGuard>
      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        body { font-family: 'Inter', sans-serif; }
      `}} />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

      {/* MAIN LAYOUT CONTAINER 
         flex-row ensures Sidebar and Main Content sit side-by-side 
      */}
      <div className="flex h-screen w-full bg-[#f0f4f9] overflow-hidden text-slate-900">
        
        {/* SIDEBAR WRAPPER
          We pass the mobile state props if your Sidebar component accepts them.
          If your Sidebar handles its own state, you can remove the props.
          The 'hidden md:flex' class ensures it behaves correctly in the flex layout.
        */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar />
        </div>

        {/* MOBILE OVERLAY */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* HEADER */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button 
                className="p-2 -ml-2 text-slate-500 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-colors md:hidden"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
              
              {/* Breadcrumbs */}
              <nav className="hidden md:flex items-center text-sm font-medium text-slate-500">
                <a className="hover:text-[#137fec] transition-colors flex items-center gap-1" href="#">
                  <span className="text-slate-400">Home</span>
                </a>
                <span className="material-symbols-outlined text-[16px] text-slate-300 mx-2">chevron_right</span>
                <a className="hover:text-[#137fec] transition-colors" href="#">Employees</a>
                <span className="material-symbols-outlined text-[16px] text-slate-300 mx-2">chevron_right</span>
                <span className="text-[#137fec] font-bold bg-blue-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">List</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
               {/* Quick Search */}
               <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-transparent focus-within:border-[#137fec] focus-within:ring-2 focus-within:ring-[#137fec]/20 transition-all w-64">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                <input className="bg-transparent border-none text-sm ml-2 focus:ring-0 text-slate-600 w-full placeholder-slate-400 outline-none" placeholder="Quick search..." type="text" />
              </div>
              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
              <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition-colors hidden md:block">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </header>

          {/* SCROLLABLE CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
              
              {/* Title & Actions */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    All Employees
                    <span className="bg-slate-100 text-slate-600 text-sm font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                      {loading ? "..." : stats.totalEmployees}
                    </span>
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm md:text-base">Manage your team members and their account permissions.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-[#137fec] transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">file_upload</span>
                    Export
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#137fec] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add New Employee
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-[#137fec] shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Employees</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalEmployees}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#137fec] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">group</span>
                    </div>
                  </div>
                </div>

                {/* Active */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{stats.active}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">check_circle</span>
                    </div>
                  </div>
                </div>
                
                {/* On Leave */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">On Leave</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{stats.onLeave}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">beach_access</span>
                    </div>
                  </div>
                </div>

                {/* New */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">New (This Month)</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{stats.newThisMonth}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">person_add</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 md:static">
                 <div className="relative w-full md:max-w-md group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#137fec] transition-colors">search</span>
                  </span>
                  <input className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all" placeholder="Search by name, ID, or email..." type="text" />
                 </div>
                 
                 <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#137fec] cursor-pointer">
                      <option>All Departments</option>
                      <option>Engineering</option>
                      <option>Design</option>
                    </select>
                    <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#137fec] cursor-pointer">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>On Leave</option>
                    </select>
                    <button className="p-2.5 text-slate-500 hover:text-[#137fec] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors">
                       <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    </button>
                    <button className="text-sm text-[#137fec] font-bold hover:underline whitespace-nowrap px-2">Reset</button>
                 </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          {['Employee', 'ID', 'Role', 'Department', 'Status', 'Actions'].map((header, idx) => (
                             <th key={header} className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${idx === 5 ? 'text-right' : 'text-left'}`}>
                                {header}
                             </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 relative">
                                  {employee.avatar_url ? (
                                    <img className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" src={employee.avatar_url} alt="" />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold ring-2 ring-white shadow-sm">{employee.full_name.charAt(0)}</div>
                                  )}
                                  <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${getOnlineStatusColor(employee.id)} ring-2 ring-white`}></span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-slate-900 group-hover:text-[#137fec] transition-colors">{employee.full_name}</div>
                                  <div className="text-xs text-slate-500">{employee.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono font-medium">{employee.employee_code}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-900 font-medium">{employee.role}</div>
                              <div className="text-xs text-slate-500">{employee.sub_role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getDeptBadgeColor(employee.department)}`}></span>
                                {employee.department}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-4 font-bold rounded-full ${getStatusBadge(employee.status)}`}>
                                {employee.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                               <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-blue-50 rounded-lg"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                {/* Pagination (Simplified) */}
                <div className="bg-white px-4 py-4 border-t border-slate-200 flex items-center justify-between">
                   <p className="text-sm text-slate-600">Showing <span className="font-bold">1</span> to <span className="font-bold">5</span> of <span className="font-bold">{stats.totalEmployees}</span></p>
                   <div className="flex gap-2">
                      <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50">Previous</button>
                      <button className="px-3 py-1 bg-[#137fec] text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20">1</button>
                      <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50">2</button>
                      <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50">Next</button>
                   </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SuperAuthGuard>
  );
}
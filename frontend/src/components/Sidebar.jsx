import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  LogOut, 
  Calendar, 
  Settings, 
  BriefcaseMedical,
  Bell
} from "lucide-react";

// Assuming these are passed as props from the parent component
const user = { name: "Jane Admin", role: "HR Manager", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBt3aqhAYEAD9pkJ4PQUpdNM3ADFjvo2iBXN0VLUyoaCaj0JFcUozXIHBP-6ggsrSn-VZGhcmLHdPbAjkMhZWwTKykBWjNVbCYDBsiXlWz6Npryo_l_bmW7CmEvJ_gq4jq6oCRs5E7dZaILv0rexKsNQjsl3-KqwNlu7gQxmpIXOpuBf7H1AR1-pSladZKNzJmoPPZLOxkwFA8BFD2YOhyJDZUQe9DxcWINVMGK_G7p49M36yV4lqh1rkoH1wxFqlZvXmeOkeWSmWc" }; 

export default function Sidebar({ handleLogout }) {
  const location = useLocation();

  // Define Navigation Items based on the UI structure
  const mainMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/super/dashboard" },
    { name: "All Employees", icon: Users, path: "/super/employees" },
    { name: "Attendance", icon: Calendar, path: "/super/attendance" },
    { name: "Leave Requests", icon: BriefcaseMedical, path: "/super/leaves" },
  ];

  
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 shadow-lg">
      
      {/* Sidebar Header/Logo */}
      <div className="p-6 border-b border-slate-100 shrink-0">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <Bell className="w-6 h-6 text-yellow-500" />
          HR Portal
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-bold uppercase tracking-wider text-gray-400 pt-2 pb-1">MENU</p>
        {mainMenuItems.map((item) => (
          <SidebarItem 
            key={item.name}
            to={item.path} 
            icon={<item.icon size={20} />} 
            label={item.name} 
            active={isActive(item.path)} 
          />
        ))}

        
      </nav>

      {/* Footer/Logout */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>

        {/* User Profile Footer */}
        <Link 
        to="/super/profile">
        <div className="flex items-center gap-3 mt-4 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
            <img className="h-9 w-9 rounded-full object-cover" src={user.avatar} alt={user.name} />
            <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
        </div>
        </Link>
      </div>
    </aside>
  );
}

// Sub-Component for individual links
function SidebarItem({ to, icon, label, active }) {
  const activeClasses = "bg-indigo-50 text-indigo-700 shadow-sm font-semibold";
  const inactiveClasses = "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium";
    
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all ${
        active 
          ? activeClasses 
          : inactiveClasses
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
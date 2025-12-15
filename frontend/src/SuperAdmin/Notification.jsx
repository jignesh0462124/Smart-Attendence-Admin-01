import React from 'react';
import {
  MdDashboard,
  MdPeople,
  MdEvent,
  MdAnnouncement,
  MdSettings,
  MdExitToApp,
  MdArrowBackIosNew,
} from 'react-icons/md';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  // Define your navigation links
  const navItems = [
    { name: 'Dashboard', icon: MdDashboard, count: 0 },
    { name: 'Employees', icon: MdPeople, count: 0 },
    { name: 'Attendance', icon: MdEvent, count: 0 },
    { name: 'Leave Requests', icon: MdArrowBackIosNew, count: 0 },
    { name: 'Notification Center', icon: MdAnnouncement, count: 1, active: true },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gray-800 text-white transition-all duration-300 z-30 
        ${isOpen ? 'w-64' : 'w-0 md:w-20'} 
        ${!isOpen && 'hidden md:block overflow-hidden'} // Hide on mobile when closed, collapse on desktop
        md:relative md:translate-x-0
        shadow-xl`}
    >
      {/* Sidebar Header/Logo */}
      <div className="flex items-center justify-between p-4 h-16 bg-gray-900">
        {isOpen && <h1 className="text-xl font-bold">Admin Dashboard</h1>}
        <button
          onClick={toggleSidebar}
          className="p-2 text-white hover:bg-gray-700 rounded-full md:hidden" // Hide on desktop, show on mobile
          aria-label="Close menu"
        >
          <MdArrowBackIosNew size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <a
              key={item.name}
              href="#"
              className={`flex items-center py-3 px-3 my-1 rounded-lg transition-colors duration-200 
                ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700'} 
                ${!isOpen && 'justify-center'}`}
            >
              <Icon size={24} className={isOpen ? 'mr-3' : 'mx-auto'} />
              <span className={`${!isOpen ? 'hidden md:block' : 'block'}`}>{item.name}</span>
              {isOpen && item.count > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Footer Links (Settings/Logout) */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <a
          href="#"
          className={`flex items-center py-3 px-3 my-1 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 
            ${!isOpen && 'justify-center'}`}
        >
          <MdSettings size={24} className={isOpen ? 'mr-3' : 'mx-auto'} />
          <span className={`${!isOpen ? 'hidden md:block' : 'block'}`}>Settings</span>
        </a>
        <a
          href="#"
          className={`flex items-center py-3 px-3 my-1 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 
            ${!isOpen && 'justify-center'}`}
        >
          <MdExitToApp size={24} className={isOpen ? 'mr-3' : 'mx-auto'} />
          <span className={`${!isOpen ? 'hidden md:block' : 'block'}`}>Logout</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
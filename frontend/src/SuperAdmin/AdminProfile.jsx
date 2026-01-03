import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import SuperAuthGuard from "../Auth/SuperAuthGuard";
import { getSuperAdminProfile, superLogout } from "./super";

/**
 * Renders the Admin Profile configuration page.
 * Connected to `superadmins` table.
 */
export default function AdminProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    company: "Smart Attendance Inc.",
    role: "Super Admin",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const data = await getSuperAdminProfile();

      if (data) {
        // Split name into First/Last for UI
        const nameParts = (data.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setProfileData({
          firstName,
          lastName,
          email: data.email,
          phone: data.phone || "",
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
          id: data.id,
          company: "Smart Attendance Inc.", // Placeholder/Static for now
          role: "Super Admin"
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- Form Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

      const { error } = await supabase
        .from('superadmins')
        .update({
          name: fullName,
          phone: profileData.phone
        })
        .eq('id', profileData.id);

      if (error) throw error;

      setIsEditing(false);
      alert("Profile updated successfully!");

    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save changes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Revert changes
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await superLogout();
      navigate("/super/login");
    }
  };

  // --- Render Logic ---
  return (
    <SuperAuthGuard>
      <div className="bg-background-light text-slate-900 h-screen flex overflow-hidden font-sans">
        {/* INJECTED STYLES */}
        <style dangerouslySetInnerHTML={{
          __html: `
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
            ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            body { font-family: 'Inter', sans-serif; }
            .bg-background-light { background-color: #f0f4f9; }
          `}} />

        {/* --- SIDEBAR --- */}
        <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
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
            <Link to="/super/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link to="/super/dashboard/employees" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">group</span>
              <span className="text-sm font-medium">Employees</span>
            </Link>
            <Link to="/super/dashboard/leaves" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">assignment</span>
              <span className="text-sm font-medium">Leave Requests</span>
            </Link>
            <Link to="/super/dashboard/notification" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-[#137fec] transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">
                notifications
              </span>
              <span className="text-sm font-medium">Notifications</span>
            </Link>

            <div className="px-3 mt-6 mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System</p>
            </div>
            <Link to="/super/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#137fec]/10 text-[#137fec] group border-l-4 border-[#137fec] shadow-sm">
              <span className="material-symbols-outlined fill-1">person</span>
              <span className="text-sm font-medium">My Profile</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </nav>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light ml-0 md:ml-0 relative">

          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
            <div className="flex items-center gap-4">
              <div className="md:hidden flex items-center gap-2 text-[#137fec] font-bold text-xl">
                <span className="material-symbols-outlined filled">hexagon</span>
                HR Admin
              </div>
              <nav className="hidden md:flex items-center text-sm font-medium text-slate-500">
                <Link to="/super/dashboard" className="hover:text-[#137fec] transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  Home
                </Link>
                <span className="material-symbols-outlined text-[16px] text-slate-300 mx-1">chevron_right</span>
                <span className="text-[#137fec] font-semibold bg-blue-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">My Profile</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/super/dashboard/profile" className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#137fec] hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined">person</span>
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                <p>Loading Profile...</p>
              </div>
            ) : (
              <div className="max-w-[1000px] mx-auto flex flex-col gap-8">

                {/* Title Area */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Settings</h2>
                  <p className="text-slate-500 mt-1 text-sm">Manage your account information and preferences.</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#137fec] to-blue-400 opacity-10"></div>

                  <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="relative group">
                      <div
                        className="h-28 w-28 rounded-full bg-cover bg-center ring-4 ring-white shadow-lg"
                        style={{ backgroundImage: `url('${profileData.avatarUrl}')` }}
                      ></div>
                      <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-slate-200 text-slate-500 hover:text-[#137fec] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      </button>
                    </div>

                    <div className="flex-1 mt-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">{profileData.firstName} {profileData.lastName}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-blue-50 text-[#137fec] text-xs font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                              {profileData.role}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 text-sm">{profileData.company}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <span className="material-symbols-outlined text-[18px] text-slate-400">mail</span>
                          <span>{profileData.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <span className="material-symbols-outlined text-[18px] text-slate-400">call</span>
                          <span>{profileData.phone || "Not set"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information Section */}
                <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <span className="material-symbols-outlined text-[20px]">badge</span>
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                        <p className="text-xs text-slate-500">Update your personal details here.</p>
                      </div>
                    </div>
                    {isEditing && (
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-100">Unsaved Changes</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* First Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">First Name</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#137fec] focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 transition-all placeholder-slate-400"
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {/* Last Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">Last Name</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#137fec] focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 transition-all placeholder-slate-400"
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {/* Email Address (Read Only) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">Email Address <span className="text-slate-400 font-normal ml-1">(Read Only)</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
                        <input
                          className="w-full rounded-lg border border-slate-200 bg-slate-100 pl-10 pr-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                          type="email"
                          name="email"
                          value={profileData.email}
                          readOnly
                        />
                      </div>
                    </div>
                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">call</span>
                        <input
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[#137fec] focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 transition-all placeholder-slate-400"
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        disabled={saving}
                      >
                        Discard
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!isEditing || saving}
                      className={`px-6 py-2.5 rounded-lg font-bold text-sm text-white shadow-sm flex items-center gap-2 transition-all
                           ${isEditing && !saving
                          ? 'bg-[#137fec] hover:bg-blue-600 hover:shadow-md'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                        `}
                    >
                      {saving ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            )}
          </div>
        </main>
      </div>
    </SuperAuthGuard>
  );
}
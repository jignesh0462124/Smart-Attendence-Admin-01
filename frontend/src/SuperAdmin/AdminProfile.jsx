import { useEffect, useState } from "react";
// Adjust path to your supabase client
import { supabase } from "../../supabase/supabase";
// Adjust path to your AuthGuard
import SuperAuthGuard from "../Auth/SuperAuthGuard";
// Import the necessary component for routing (used for handleLogout logic)
import { useNavigate } from "react-router-dom"; 

// Assume superLogout function is available globally or imported from "../super"
const superLogout = () => { /* Mock logout logic */ console.log("Logging out..."); };

// NEW: Import the reusable Sidebar
import Sidebar from "../components/Sidebar"; 

/**
 * Renders the Admin Profile configuration page.
 */
export default function AdminProfile() {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "sarah.jenkins@company.com",
    phone: "+1 (555) 012-3456",
    bio: "Experienced HR Administrator with over 8 years in the field. Specializing in employee relations, benefits administration, and compliance.",
    street: "123 Corporate Blvd, Suite 400",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "United States",
    role: "Senior HR Administrator",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGX8oFF4BtJM7lCsJNiRGTlwgJQFkLVf94GCQc01mRr0JAeSitSFpQSxKBGR-D74fJb5AZnnr_jlUACSuWIchEXRcfSlK389HGjX2kRHiR-QDt5XB4dNVKItglSLNrUKcn_ZnWrztyUEdiBJL6Qqxg1fIlqkRzd5N08F-lYB7hTDDLUPu7sLz9mYeZPC1-Ek_XurOom-B6foM4oOEPmZ7oDx5qatrwNTHzFBYwsFjKmPGbiAm8YlmDiPnoKaiCllNkUeJ3q1fYf_c",
  });
  const [loading, setLoading] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 

  // --- Form Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    // [Supabase update mock here]
    setTimeout(() => {
        setLoading(false);
        setIsEditing(false);
        console.log("Mock data saved:", profileData);
        alert("Profile updated successfully! (Mock Save)");
    }, 1000);
  };

  const handleCancel = () => {
    // In a real scenario, you'd reset profileData to the original fetch state.
    setIsEditing(false);
  };
  
  // --- Logout Handler ---
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      await superLogout();
      navigate("/login"); 
    }
  };

  // --- Render Logic ---
  return (
    <SuperAuthGuard>
      {/* INJECTED STYLES:
        Ensures the use of Material Symbols font settings and sets the base font.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Spline Sans', sans-serif;
            background-color: #f6f7f8; /* background-light */
        }
        /* Custom scrollbar matching the general light theme */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />

      {/* Main Layout Container (Light Theme only) */}
      <div className="flex min-h-screen w-full flex-col bg-[#f6f7f8] font-display text-[#111418] antialiased">
        
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-4 md:px-10 py-3">
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center p-1 text-slate-500 hover:text-slate-700 transition-colors lg:hidden">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="size-8 text-[#137fec]">
              {/* Logo SVG */}
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="hidden md:block text-[#111418] text-lg font-bold leading-tight">HR Admin Dashboard</h2>
          </div>
          <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
            {/* Search Bar */}
            <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 bg-slate-50 overflow-hidden">
                <div className="text-slate-500 flex items-center justify-center pl-4">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-[#111418] focus:outline-0 focus:ring-0 border-none h-full placeholder:text-slate-400 px-4 text-sm font-normal leading-normal" placeholder="Search employees..."/>
              </div>
            </label>
            {/* Notifications */}
            <div className="flex gap-2">
              <button className="flex items-center justify-center rounded-lg size-10 bg-slate-50 text-[#111418] hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
            {/* Avatar Thumbnail */}
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-[#137fec]/20" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfbKUEsaclfgKSuk6vTqMQonnhrBpA-ps_PPwAfvU6eicABNaTfkFPSZOvAUHZvOtqmGyLcLpcI4-y8B2L3SBRp-5KJHXSPYISdVCr1IgwSuxy2XwE1Co6ZgUHXUsLkwQuke6c9_zWqs1BTLPjBO1ll56LzXuCzaTi7_2HuIMNeVgERppOlh8k6m8-X8Kkl2-9h57PECZkNY0eTQe43nS2tFdV1cXkPFd1XTn_PFeVn76zQ_4qxYdgUzPEeF8Br_Iug2S5XKKsyPA')` }} data-alt="Admin profile photo thumbnail"></div>
          </div>
        </header>

        {/* --- MAIN BODY LAYOUT --- */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* --- SIDEBAR (Modular Component) --- */}
          {/* This replaces the old <aside> block */}
          <Sidebar handleLogout={handleLogout} />
          
          {/* --- MAIN CONTENT (PROFILE FORM) --- */}
          <main className="flex-1 bg-[#f6f7f8] p-4 md:p-8 lg:px-12 overflow-y-auto">
            <form onSubmit={handleSave} className="mx-auto max-w-5xl flex flex-col gap-6">
              
              {/* Page Title */}
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#111418]">Admin Profile</h1>
                <p className="text-slate-500">Manage your personal details and contact information.</p>
              </div>
              
              {/* Profile Card & Navigation */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div 
                        className="size-24 md:size-32 rounded-full bg-cover bg-center ring-4 ring-slate-50" 
                        style={{ backgroundImage: `url('${profileData.avatarUrl}')` }} 
                        data-alt="High resolution profile photo of Sarah Jenkins"
                      ></div>
                      <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition-colors" title="Change photo">
                        <span className="material-symbols-outlined text-[20px] text-slate-600">photo_camera</span>
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-bold text-[#111418]">{profileData.firstName} {profileData.lastName}</h2>
                      <p className="text-[#137fec] font-medium">{profileData.role}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                        <span>{profileData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Tabs */}
                <div className="mt-8 border-b border-slate-200">
                  <nav className="flex gap-6 -mb-px overflow-x-auto">
                    <a className="border-b-2 border-[#137fec] pb-3 px-1 text-sm font-semibold text-[#137fec]" href="#">Personal Info</a>
                    <a className="border-b-2 border-transparent pb-3 px-1 text-sm font-medium text-slate-500 hover:text-slate-700" href="#">Notifications</a>
                    <a className="border-b-2 border-transparent pb-3 px-1 text-sm font-medium text-slate-500 hover:text-slate-700" href="#">Team</a>
                  </nav>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#111418]">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <input 
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                      type="text" 
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Last Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <input 
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                      type="text" 
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
                      <input 
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                        type="email" 
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  {/* Phone Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">call</span>
                      <input 
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                        type="tel" 
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  {/* Bio */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Bio</label>
                    <textarea 
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                      rows="3"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#111418]">Address</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Street Address */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Street Address</label>
                    <input 
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                      type="text" 
                      name="street"
                      value={profileData.street}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* City */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <input 
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                      type="text" 
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* State / Province */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">State / Province</label>
                    <input 
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                      type="text" 
                      name="state"
                      value={profileData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Postal Code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Postal Code</label>
                    <input 
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] placeholder-slate-400" 
                      type="text" 
                      name="postalCode"
                      value={profileData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Country */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Country</label>
                    <div className="relative">
                      <select 
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#111418] focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] appearance-none"
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-3 text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 justify-end">
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors md:w-auto w-full"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`flex items-center justify-center rounded-xl bg-[#137fec] px-8 py-3 text-sm font-bold text-white shadow-md transition-colors md:w-auto w-full 
                    ${isEditing && !loading ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}
                  `}
                  disabled={!isEditing || loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </SuperAuthGuard>
  );
}
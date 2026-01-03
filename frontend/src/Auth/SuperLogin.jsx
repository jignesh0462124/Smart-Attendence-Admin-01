import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";

export default function SuperLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      /* ===============================
         1. AUTH LOGIN
      =============================== */
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!data.user) throw new Error("Login failed. Please try again.");

      /* ===============================
         2. VERIFY SUPER ADMIN ROLE
      =============================== */
      // Correctly querying 'superadmins' table using 'auth_uid' to match the authenticated user
      const { data: superAdmin, error: roleError } = await supabase
        .from("superadmins")
        .select("*")
        .eq("auth_uid", data.user.id)
        .single();

      if (roleError || !superAdmin) {
        // IMPORTANT: improved security - sign out immediately if they are not in the admin table
        await supabase.auth.signOut();
        throw new Error("Access denied: You are not authorized as a Super Admin.");
      }

      /* ===============================
         3. UPDATE AUDIT & REDIRECT
      =============================== */
      // Update last_login timestamp, ignoring errors if this simple update fails
      const { error: updateError } = await supabase
        .from("superadmins")
        .update({ last_login: new Date().toISOString() })
        .eq("id", superAdmin.id);

      if (updateError) {
        console.warn("Failed to update last_login:", updateError);
      }

      navigate("/super/dashboard");

    } catch (err) {
      console.error("Admin login error:", err);
      // Friendly error message mapping
      let msg = err.message;
      if (msg.includes("Invalid login credentials")) msg = "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all hover:shadow-2xl">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-12 -translate-y-12 blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 translate-y-12 blur-xl"></div>

          <div className="relative z-10 mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30 shadow-lg">
            <ShieldCheck className="text-white w-9 h-9" />
          </div>
          <h2 className="relative z-10 text-2xl font-bold text-white tracking-tight">Super Admin Portal</h2>
          <p className="relative z-10 text-blue-100 mt-2 text-sm font-medium">Secure access for administrators</p>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm p-4 rounded-r shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0">error</span>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider mb-0.5">Authentication Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-gray-50/50 focus:bg-white"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4 group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Secure Login</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </div>
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Monitor. Manage. Optimize.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
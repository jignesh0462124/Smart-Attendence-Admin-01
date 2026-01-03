import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../supabase/supabase";

export default function SuperAuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      // 1. Check logged-in user
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        setAuthorized(false);
        return;
      }

      // 2. Verify super admin role
      const { data: superAdmin, error: roleError } = await supabase
        .from("superadmins")
        .select("id")
        .eq("auth_uid", authData.user.id)
        .single();

      if (roleError || !superAdmin) {
        setAuthorized(false);
        return;
      }

      // 3. Access granted
      setAuthorized(true);
    } catch (err) {
      console.error("SuperAuthGuard error:", err);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/super/login" replace />;
  }

  return children;
}

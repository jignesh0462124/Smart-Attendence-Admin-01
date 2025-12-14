import { supabase } from "../../supabase/supabase";

/* =========================
   AUTH HELPERS (NO JSX)
========================= */
export async function getCurrentAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Not logged in");
  return data.user;
}

export async function getSuperAdminProfile() {
  const user = await getCurrentAuthUser();

  const { data, error } = await supabase
    .from("superadmins")
    .select("id, email, name")
    .eq("auth_uid", user.id)
    .single();

  if (error || !data) {
    throw new Error("Access denied");
  }

  return data;
}

/* =========================
   ATTENDANCE
========================= */
export async function fetchAttendanceByMonth(year, month) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function superLogout() {
  await supabase.auth.signOut();
}

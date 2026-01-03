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
    .select("*")
    .eq("auth_uid", user.id)
    .single();

  if (error || !data) {
    throw new Error("Access denied: Not a Super Admin");
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

  // 1. Fetch Attendance
  const { data: attendanceData, error: attendanceError } = await supabase
    .from("attendance")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("created_at", { ascending: false });

  if (attendanceError) throw attendanceError;

  if (!attendanceData || attendanceData.length === 0) return [];

  // 2. Fetch Profiles map
  const userIds = [...new Set(attendanceData.map((a) => a.user_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, profile_image")
    .in("id", userIds);

  if (profilesError) {
    console.error("Error fetching profiles for attendance:", profilesError);
    // Don't throw, just return attendance without names
  }

  const profilesMap = (profiles || []).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  // 3. Merge
  return attendanceData.map((record) => {
    const profile = profilesMap[record.user_id];
    return {
      ...record,
      full_name: profile?.full_name || "Unknown",
      email: profile?.email || "N/A",
      profile_image: profile?.profile_image,
    };
  });
}

export async function superLogout() {
  await supabase.auth.signOut();
}

/* =========================
   EMPLOYEES
========================= */
export async function fetchAllEmployees() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/* =========================
   LEAVES
========================= */
export async function fetchAllLeaveRequests() {
  // 1. Fetch Leaves
  const { data: leavesData, error: leavesError } = await supabase
    .from('leaves')
    .select('*')
    .order('created_at', { ascending: false });

  if (leavesError) throw leavesError;

  if (!leavesData || leavesData.length === 0) return [];

  // 2. Fetch Profiles for names/avatars
  const userIds = [...new Set(leavesData.map(l => l.user_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, role, profile_image')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  const profilesMap = (profiles || []).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  // 3. Merge
  return leavesData.map(leave => ({
    ...leave,
    employee_name: profilesMap[leave.user_id]?.full_name || 'Unknown',
    role: profilesMap[leave.user_id]?.role || 'Employee',
    avatar_url: profilesMap[leave.user_id]?.profile_image
  }));
}

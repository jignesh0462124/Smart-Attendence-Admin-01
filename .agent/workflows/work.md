---
description: 
---

# Admin Project Integration Guide

This guide details how to build the **Admin Dashboard** project to connect with the existing **SmartAttend Employee Portal**.

## 1. Architecture Overview

*   **Employee Portal (Current Project)**: Handles data *creation* (Check-ins, Leave Requests, Ticket creation).
*   **Admin Dashboard (New Project)**: Handles data *management* (Approvals, Reports, Employee Management).
*   **Shared Backend**: Both projects **MUST** connect to the **Same Supabase Project**.

## 2. Database Connection

In your new Admin Project, you must use the same Supabase credentials to access the shared data.

### `.env` Setup
Copy these keys from your Employee Portal to your Admin Project:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Note**: For sensitive admin operations (like deleting users or unrestricted access), you might eventually need the `SUPABASE_SERVICE_ROLE_KEY`. **Never expose the Service Role Key in the frontend code.** For a purely client-side admin dashboard, rely on Row Level Security (RLS) policies that grant access based on the user's `role = 'admin'`.

## 3. Required Features & Data Access

The Admin Project needs to interact with the following tables. Ensure your Admin UI implements these features:

### A. Employee Management (`public.profiles`)
*   **View**: List all registered employees.
*   **Action**: Edit employee details, assign roles (promoted specific users to 'admin').
*   **Schema Fields**: `id`, `email`, `full_name`, `role`, `department`, `designation`.

### B. Attendance Monitoring (`public.attendance`)
*   **View**: See today's check-ins in real-time.
*   **View**: correct "Absent" vs "Present" status.
*   **Action**: Generate monthly attendance reports.
*   **Schema Fields**: `user_id`, `date`, `check_in`, `check_out`, `status`, `photo_url`, `location`.

### C. Leave Management (`public.leaves`)
*   **View**: List of pending leave requests.
*   **Action**: **Approve** or **Reject** leaves.
    *   *Critical*: When a leave is approved, the system should ideally prevent "Absent" marking for that day.
*   **Schema Fields**: `status` (update this column to 'Approved' or 'Rejected').

### D. Helpdesk / Support (`public.tickets`) (Future)
*   **View**: User submitted issues.
*   **Action**: Reply to tickets or mark them as resolved.

### E. Notifications (`public.notifications`)
*   **Action**: Send announcements to all employees.
*   **How**: Insert a new row into the `notifications` table.
    *   `user_id`: Target user (or handle logic for "broadcast" to all).
    *   `title`: "Office Closed", etc.
    *   `type`: 'info', 'warning', etc.

## 4. Admin Authentication

1.  **Login**: Use the same `supabase.auth.signInWithPassword` as the employee portal.
2.  **Protection**:
    *   Create a `ProtectedAdminRoute` component.
    *   Check `userProfile.role === 'admin'`.
    *   If a normal employee tries to log in to the Admin Dashboard, redirect them away.

## 5. Row Level Security (RLS) Checklist

Ensure your Supabase Policies allow admins to view everything:

```sql
-- Example Policy for Admin Access
CREATE POLICY "Admins can do everything"
ON public.attendance
FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);
```

*Repeat similar policies for `profiles`, `leaves`, and `notifications` if they don't exist yet.*

---

## Summary of Work for Admin Project
1.  Initialize new React/Vite project.
2.  Install `@supabase/supabase-js`, `react-router-dom`, `tailwindcss`.
3.  Copy `supabase.js` client setup.
4.  Build **Dashboard** (Overall stats).
5.  Build **Employee List** (Manage users).
6.  Build **Leave Approval** page (Update `leaves` table).
7.  Build **Attendance Report** page (Read `attendance` table).


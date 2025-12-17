import { Routes, Route, Navigate } from "react-router-dom";
import SuperLogin from "./Auth/SuperLogin";
import SuperDashboard from "./SuperAdmin/SuperDashboard";
import SuperAuthGuard from "./Auth/SuperAuthGuard";
import Notification from "./SuperAdmin/Notification";
import AllEmployeeList from "./SuperAdmin/AllEmployeeList";
import LeaveRequest from "./SuperAdmin/LeaveRequest";
import AdminProfile from "./SuperAdmin/AdminProfile";

export default function App() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/super/login" replace />} />

      {/* Login */}
      <Route path="/login" element={<SuperLogin />} />
      <Route path="/super/login" element={<SuperLogin />} />

      {/* Protected Super Admin Route */}
      <Route
        path="/super/dashboard"
        element={
          <SuperAuthGuard>
            <SuperDashboard />
          </SuperAuthGuard>
        }
      />

      <Route path="/super/dashboard/notification"
       element={<SuperAuthGuard>
            <Notification />
          </SuperAuthGuard>} />

      <Route path="/super/employees"
       element={<SuperAuthGuard>
            <AllEmployeeList />
          </SuperAuthGuard>} />

        <Route path="/super/leaves"
       element={<SuperAuthGuard>
            <LeaveRequest />
          </SuperAuthGuard>} />

           <Route path="/super/profile"
       element={<SuperAuthGuard>
            <AdminProfile />
          </SuperAuthGuard>} />
    </Routes>

    
    
  );
}

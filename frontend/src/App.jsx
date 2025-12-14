import { Routes, Route, Navigate } from "react-router-dom";
import SuperLogin from "./Auth/SuperLogin";
import SuperDashboard from "./SuperAdmin/SuperDashboard";
import SuperAuthGuard from "./Auth/SuperAuthGuard";

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
    </Routes>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffProfile from './pages/staff/StaffProfile';
import StaffLeaves from './pages/staff/StaffLeaves';
import StaffSalary from './pages/staff/StaffSalary';
import StaffEOD from './pages/staff/StaffEOD';
import StaffAnnouncements from './pages/staff/StaffAnnouncements';
import StaffHolidays from './pages/staff/StaffHolidays';
import StaffNotifications from './pages/staff/StaffNotifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminSalaries from './pages/admin/AdminSalaries';
import AdminEOD from './pages/admin/AdminEOD';
import AdminHolidays from './pages/admin/AdminHolidays';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminReports from './pages/admin/AdminReports';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import { useAuth } from './context/AuthContext';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/staff'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/" element={<RootRedirect />} />

      <Route path="/staff" element={<ProtectedRoute role="staff"><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/profile" element={<ProtectedRoute role="staff"><StaffProfile /></ProtectedRoute>} />
      <Route path="/staff/leaves" element={<ProtectedRoute role="staff"><StaffLeaves /></ProtectedRoute>} />
      <Route path="/staff/salary" element={<ProtectedRoute role="staff"><StaffSalary /></ProtectedRoute>} />
      <Route path="/staff/eod" element={<ProtectedRoute role="staff"><StaffEOD /></ProtectedRoute>} />
      <Route path="/staff/announcements" element={<ProtectedRoute role="staff"><StaffAnnouncements /></ProtectedRoute>} />
      <Route path="/staff/holidays" element={<ProtectedRoute role="staff"><StaffHolidays /></ProtectedRoute>} />
      <Route path="/staff/notifications" element={<ProtectedRoute role="staff"><StaffNotifications /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute role="admin"><AdminEmployees /></ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute role="admin"><AdminLeaves /></ProtectedRoute>} />
      <Route path="/admin/salaries" element={<ProtectedRoute role="admin"><AdminSalaries /></ProtectedRoute>} />
      <Route path="/admin/eod" element={<ProtectedRoute role="admin"><AdminEOD /></ProtectedRoute>} />
      <Route path="/admin/holidays" element={<ProtectedRoute role="admin"><AdminHolidays /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute role="admin"><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute role="admin"><AdminAuditLogs /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><StaffNotifications /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { CampaignManagementPage } from './pages/CampaignManagementPage';
import { CampaignPreviewPage } from './pages/CampaignPreviewPage';
import { CampaignRecipientsPage } from './pages/CampaignRecipientsPage';
import { CampaignSendPage } from './pages/CampaignSendPage';
import { NotificationLogsPage } from './pages/NotificationLogsPage';
import { UserPreferenceLoginPage } from './pages/UsersLogin';
import { UserPreferenceSettingsPage } from './pages/UserPreferencePortalPage';
import { EmployeeRoute } from './components/EmployeeRoute';
import { UserRoute } from './components/UserRoute';
import { RoleRoute } from './components/RoleRoute';

function EmployeeRedirect() {
  const { employee } = useAuth();

  if (!employee) return <Navigate to="/employee/login" />;

  if (employee.role_id == 1) return <Navigate to="/dashboard" />;
  return <Navigate to="/campaigns" />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* User */}
      <Route path="/user/login" element={<UserPreferenceLoginPage />} />
      <Route
        path="/user/:userId/preferences"
        element={<UserPreferenceSettingsPage />}
      />


      {/* Employee */}
      <Route path="/employee/login" element={<LoginPage />} />
      <Route path="/employee" element={<EmployeeRedirect />} />

      {/* Admin */}
      <Route
        path="/dashboard"
        element={
          <RoleRoute allow={[1]}>
            <DashboardPage />
          </RoleRoute>
        }
      />

      <Route
        path="/users"
        element={
          <RoleRoute allow={[1, 2]}>
            <UserManagementPage />
          </RoleRoute>
        }
      />

      <Route
        path="/campaigns"
        element={
          <RoleRoute allow={[1, 2, 3]}>
            <CampaignManagementPage />
          </RoleRoute>
        }
      />


      <Route
        path="/campaigns/:id/preview"
        element={
          <RoleRoute allow={[1, 2, 3]}>
            <CampaignPreviewPage />
          </RoleRoute>
        }
      />
      <Route
        path="/campaigns/:id/recipients"
        element={<CampaignRecipientsPage />}
      />

      <Route
        path="/campaigns/:id/send"
        element={
          <RoleRoute allow={[1, 3]}>
            <CampaignSendPage />
          </RoleRoute>
        }
      />

      {/* Logs */}
      <Route
        path="/logs"
        element={
          <RoleRoute allow={[1]}>
            <NotificationLogsPage />
          </RoleRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

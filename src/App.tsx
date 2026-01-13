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
import { UserPreferenceSettingsPage } from './pages/UserPreferencePortalPage';
import { EmployeeRoute } from './components/EmployeeRoute';
import { UserRoute } from './components/UserRoute';
import { RoleRoute } from './components/RoleRoute';
import { EmployeeManagementPage } from './pages/EmployeeManagementPage';
import { NotificationPage } from './pages/NotificationPage';
import { NewsletterManagementPage } from './pages/NewsletterManagementPage';
import { NewsletterPreviewPage } from './pages/NewsletterPreviewPage';
import { NewsletterSendPage } from './pages/NewsletterSendPage';

function EmployeeRedirect() {
  const { employee } = useAuth();

  if (!employee) return <Navigate to="/login" />;

  if (employee.role_id == 1) return <Navigate to="/dashboard" />;
  return <Navigate to="/notifications" />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* User Preferences */}
      <Route
        path="/user/:userId/preferences"
        element={<UserPreferenceSettingsPage />}
      />

      {/* Redirects for backward compatibility */}
      <Route path="/employee/login" element={<Navigate to="/login" replace />} />
      <Route path="/user/login" element={<Navigate to="/login" replace />} />
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
        path="/employeesmgmt"
        element={
          <RoleRoute allow={[1]}>
            <EmployeeManagementPage />
          </RoleRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <RoleRoute allow={[1, 2, 3]}>
            <NotificationPage />
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
      <Route
        path="/newsletters"
        element={
          <RoleRoute allow={[1, 2, 3]}>
            <NewsletterManagementPage />
          </RoleRoute>
        }
      />

      <Route
        path="/newsletters/:id/preview"
        element={
          <RoleRoute allow={[1, 2, 3]}>
            <NewsletterPreviewPage />
          </RoleRoute>
        }
      />
      <Route
        path="/newsletters/:id/recipients"
        element={<NewsletterPreviewPage />}
      />

      <Route
        path="/newsletters/:id/send"
        element={
          <RoleRoute allow={[1, 3]}>
            <NewsletterSendPage />
          </RoleRoute>
        }
      />

      {/* Logs */}
      <Route
        path="/logs"
        element={
          <RoleRoute allow={[1, 2, 3]}>
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

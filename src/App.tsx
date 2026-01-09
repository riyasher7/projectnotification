import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { UserPreferencesViewPage } from './pages/UserPreferencesViewPage';
import { CampaignManagementPage } from './pages/CampaignManagementPage';
import { CampaignPreviewPage } from './pages/CampaignPreviewPage';
import { CampaignSendPage } from './pages/CampaignSendPage';
import { NotificationLogsPage } from './pages/NotificationLogsPage';
import { UserPreferenceLoginPage } from './pages/UsersLogin';
import { UserPreferenceSettingsPage } from './pages/UserPreferencePortalPage';

export type Page =
  | 'home'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'users'
  | 'user-preferences-view'
  | 'campaigns'
  | 'campaign-preview'
  | 'campaign-send'
  | 'logs'
  | 'user-preference-login'
  | 'user-preferences';

function AppContent() {
  const { employee } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee && !employee) {
      setCurrentPage('dashboard');
    }
  }, [employee]);

  const navigate = (page: Page, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
  };

  if (currentPage === 'home') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onNavigate={navigate} />;
  }

  if (currentPage === 'user-preference-login') {
    return <UserPreferenceLoginPage onNavigate={navigate} />;
  }

  if (currentPage === 'user-preferences') {
    if (!pageData?.userId || !pageData?.preferences) {
      return <UserPreferenceLoginPage onNavigate={navigate} />;
    }

    return (
      <UserPreferenceSettingsPage
        onNavigate={navigate}
        userId={pageData.userId}
        initialPreferences={pageData.preferences}
      />
    );
  }

  if (!employee) {
    return <LoginPage onNavigate={navigate} />;
  }

  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage onNavigate={navigate} />;
    case 'users':
      return <UserManagementPage onNavigate={navigate} />;
    case 'user-preferences-view':
      return <UserPreferencesViewPage onNavigate={navigate} userId={pageData?.userId} />;
    case 'campaigns':
      return <CampaignManagementPage onNavigate={navigate} />;
    case 'campaign-preview':
      return <CampaignPreviewPage onNavigate={navigate} campaignId={pageData?.campaignId} />;
    case 'campaign-send':
      return <CampaignSendPage onNavigate={navigate} campaignId={pageData?.campaignId} />;
    case 'logs':
      return <NotificationLogsPage onNavigate={navigate} />;
    default:
      return <DashboardPage onNavigate={navigate} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;


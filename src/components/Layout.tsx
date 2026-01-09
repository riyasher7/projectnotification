import { ReactNode } from 'react';
import { LogOut, Home, Users, Mail, Bell, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../App';

type LayoutProps = {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page, data?: any) => void;
};

//type LayoutProps = {
//  children: ReactNode;
//  currentPage?: string;
//  onNavigate?: (page: string) => void;
//};

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { employee, logout, isAdmin, isCreator, isViewer } = useAuth();

  if (!employee) {
    return <>{children}</>;
  }
  type NavItem = {
  name: string;
  icon: React.ComponentType<any>;
  page: Page;
  roles: string[];
  };

  const navigation: NavItem[] = [
  { name: 'Dashboard', icon: Home, page: 'dashboard', roles: ['admin', 'creator', 'viewer'] },
  { name: 'Users', icon: Users, page: 'users', roles: ['admin', 'creator'] },
  { name: 'Campaigns', icon: Mail, page: 'campaigns', roles: ['admin', 'creator', 'viewer'] },
  { name: 'Notifications', icon: Bell, page: 'logs', roles: ['admin', 'viewer'] },
 ];

  const filteredNav = navigation.filter(item => item.roles.includes(employee.role));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white">Nykaa</h1>
              </div>
              <div className="ml-10 flex items-baseline space-x-4">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.page}
                      onClick={() => onNavigate?.(item.page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                        currentPage === item.page
                          ? 'bg-pink-700 text-white'
                          : 'text-pink-100 hover:bg-pink-600 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <div className="font-medium">{employee.full_name}</div>
                <div className="text-pink-100 text-xs capitalize">{employee.role}</div>
              </div>
              <button
                onClick={logout}
                className="bg-pink-700 hover:bg-pink-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

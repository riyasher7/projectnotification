import { ReactNode } from 'react';
import { LogOut, Home, Users, Mail, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type LayoutProps = {
  children: ReactNode;
};

/**
 * Role ID mapping:
 * 1 = Admin
 * 2 = Creator
 * 3 = Viewer
 */
type RoleId = 1 | 2 | 3;

type NavItem = {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  roles: RoleId[];
};

const getRoleName = (roleId: RoleId) => {
  switch (roleId) {
    case 1:
      return 'Admin';
    case 2:
      return 'Creator';
    case 3:
      return 'Viewer';
    default:
      return 'Unknown';
  }
};

export function Layout({ children }: LayoutProps) {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!employee) {
    return <>{children}</>;
  }

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      roles: [1],
    },
    {
      name: 'Users',
      icon: Users,
      path: '/users',
      roles: [1, 2],
    },
    {
      name: 'Campaigns',
      icon: Mail,
      path: '/campaigns',
      roles: [1, 2, 3],
    },
    {
      name: 'Employees',
      icon: Users,
      path: '/employeesmgmt',
      roles: [1],
    },
    {
      name: 'Notifications',
      icon: Bell,
      path: '/logs',
      roles: [1, 3],
    },
  ];

  const filteredNav = navigation.filter(item =>
    item.roles.includes(employee.role_id as RoleId)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand + Nav */}
            <div className="flex items-center">
              <h1
                className="text-2xl font-bold text-white cursor-pointer"
                onClick={() => navigate('/')}
              >
                Nykaa
              </h1>

              <div className="ml-10 flex items-baseline space-x-4">
                {filteredNav.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                        isActive
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

            {/* User + Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm text-right">
                <div className="font-medium">{employee.email}</div>
                <div className="text-pink-100 text-xs capitalize">
                  {getRoleName(employee.role_id as RoleId)}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/employee/login');
                }}
                className="bg-pink-700 hover:bg-pink-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

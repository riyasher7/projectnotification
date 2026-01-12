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
    <div className="min-h-screen bg-grey-100">
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-white-500 to-white-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand + Nav */}
            <div className="flex items-center">
              <h1
                className="text-2xl font-bold text-white cursor-pointer"
                onClick={() => navigate('/')}
              >
                <img src="/nykaa-logo.png" alt="Nykaa logo" className="w-40 h-auto mb-1 mx-auto" />
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
                          ? 'bg-[#FF1774] text-white'
                          : 'text-[#FF1774] hover:bg-[#FF1774] hover:text-white'
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
              <div className="text-[#FF1774] text-sm text-right">
                <div className="font-medium">{employee.email}</div>
                <div className="text-[#FF1774] text-xs capitalize">
                  {getRoleName(employee.role_id as RoleId)}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/employee/login');
                }}
                className="bg-[#FF1774] hover:bg-[#FF1774] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
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

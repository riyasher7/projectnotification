import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RoleRoute({
  children,
  allow,
}: {
  children: JSX.Element;
  allow: Array<'admin' | 'creator' | 'viewer'>;
}) {
  const { employee } = useAuth();

  if (!employee) {
    return <Navigate to="/employee/login" replace />;
  }

  if (!allow.includes(employee.role)) {
    return <Navigate to="/campaigns" replace />;
  }

  return children;
}

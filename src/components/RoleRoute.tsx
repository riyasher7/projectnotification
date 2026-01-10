import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Role ID mapping:
 * 1 = Admin
 * 2 = Creator
 * 3 = Viewer
 */
type RoleId = 1 | 2 | 3;

export function RoleRoute({
  children,
  allow,
}: {
  children: JSX.Element;
  allow: RoleId[];
}) {
  const { employee } = useAuth();

  if (!employee) {
    return <Navigate to="/employee/login" replace />;
  }

  if (!allow.includes(employee.role_id as RoleId)) {
    return <Navigate to="/campaigns" replace />;
  }

  return children;
}

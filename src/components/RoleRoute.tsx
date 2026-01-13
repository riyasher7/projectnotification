import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Role ID mapping:
 * 1 = Admin
 * 2 = Creator
 * 3 = Viewer
 * 4 = User
 */
type RoleId = 1 | 2 | 3 | 4;

export function RoleRoute({
  children,
  allow,
}: {
  children: JSX.Element;
  allow: RoleId[];
}) {
  const { employee } = useAuth();

  if (!employee) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(employee.role_id as RoleId)) {
    return <Navigate to="/notifications" replace />;
  }

  return children;
}

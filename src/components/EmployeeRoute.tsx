import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function EmployeeRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { employee } = useAuth();

  if (!employee) {
    return <Navigate to="/employee/login" replace />;
  }

  return children;
}

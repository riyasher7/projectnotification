import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function UserRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
}

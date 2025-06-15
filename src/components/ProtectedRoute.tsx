
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

type Role = 'admin';

interface ProtectedRouteProps {
  roles: Role[];
}

const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { roles: userRoles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  const hasRequiredRole = userRoles.some(role => roles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

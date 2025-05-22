import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { checkPermission } from '../../services/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requiredRole && !checkPermission(requiredRole)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && !checkPermission(requiredRole)) {
    return null; // Will redirect in useEffect
  }

  return children;
};

export default ProtectedRoute;
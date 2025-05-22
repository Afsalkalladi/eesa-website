import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../../components/Dashboard/AdminDashboard';
import FacultyDashboard from '../../components/Dashboard/FacultyDashboard';
import StudentDashboard from '../../components/Dashboard/StudentDashboard';

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/login?redirect=dashboard');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If not authenticated and not loading, don't render anything
  // (useEffect will redirect to login)
  if (!isAuthenticated()) {
    return null;
  }

  // Render the appropriate dashboard based on user type
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {user.user_type === 'admin' ? (
          <AdminDashboard />
        ) : user.user_type === 'faculty' ? (
          <FacultyDashboard />
        ) : user.user_type === 'student' ? (
          <StudentDashboard />
        ) : (
          <div className="text-center py-8">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-lg mx-auto">
              <p className="font-bold">Unknown User Type</p>
              <p>Your account type is not recognized. Please contact the administrator.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
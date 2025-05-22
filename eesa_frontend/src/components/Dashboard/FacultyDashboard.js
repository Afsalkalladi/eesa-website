import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBook, FaUserGraduate, FaClipboardList, FaFileAlt } from 'react-icons/fa';
import api from '../../services/api';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    subjects: 0,
    assignments: 0,
    pendingNotes: 0,
    students: 0,
    studyMaterials: 0
  });
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch faculty profile
      try {
        const profileResponse = await api.get('/users/faculty/me/');
        setFacultyProfile(profileResponse);
      } catch (profileError) {
        console.error('Error fetching faculty profile:', profileError);
      }

      // Fetch stats from various endpoints
      const [subjectsRes, assignmentsRes, notesRes, studentsRes, materialsRes] = await Promise.all([
        api.get('/academics/faculty-subjects/').catch(() => ({ data: [] })),
        api.get('/academics/assignments/').catch(() => ({ data: [] })),
        api.get('/library/notes/?status=pending').catch(() => ({ data: [] })),
        api.get('/users/students/').catch(() => ({ data: [] })),
        api.get('/academics/study-materials/').catch(() => ({ data: [] }))
      ]);

      setStats({
        subjects: Array.isArray(subjectsRes.data || subjectsRes) ? (subjectsRes.data || subjectsRes).length : 0,
        assignments: Array.isArray(assignmentsRes.data || assignmentsRes) ? 
          (assignmentsRes.data || assignmentsRes).filter(a => {
            const dueDate = new Date(a.due_date);
            return dueDate > new Date();
          }).length : 0,
        pendingNotes: Array.isArray(notesRes.data || notesRes) ? (notesRes.data || notesRes).length : 0,
        students: Array.isArray(studentsRes.data || studentsRes) ? (studentsRes.data || studentsRes).length : 0,
        studyMaterials: Array.isArray(materialsRes.data || materialsRes) ? (materialsRes.data || materialsRes).length : 0
      });

      // Set assigned subjects
      if (Array.isArray(subjectsRes.data || subjectsRes)) {
        setAssignedSubjects(subjectsRes.data || subjectsRes);
      }

      // Set recent activity for pending notes
      if (Array.isArray(notesRes.data || notesRes) && (notesRes.data || notesRes).length > 0) {
        setRecentActivity([
          {
            type: 'pending_notes',
            count: (notesRes.data || notesRes).length,
            message: `${(notesRes.data || notesRes).length} notes are waiting for your review`
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Faculty Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Welcome Card */}
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {facultyProfile?.user?.first_name || user?.first_name || 'Faculty'}!
          </h2>
          <p className="text-gray-600 mb-2">
            {facultyProfile?.designation} - {facultyProfile?.department}
          </p>
          <p className="text-gray-600">
            You have {stats.pendingNotes} notes pending review and {stats.assignments} active assignments.
          </p>
        </div>
        
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <FaBook className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-500">Assigned Subjects</p>
                <p className="font-semibold text-lg">{stats.subjects}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaFileAlt className="text-yellow-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-500">Pending Notes</p>
                <p className="font-semibold text-lg">{stats.pendingNotes}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaClipboardList className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-500">Active Assignments</p>
                <p className="font-semibold text-lg">{stats.assignments}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaUserGraduate className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-500">Study Materials</p>
                <p className="font-semibold text-lg">{stats.studyMaterials}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
            onClick={() => handleNavigation('/faculty/attendance')}
          >
            Mark Attendance
          </button>
          <button 
            className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition"
            onClick={() => handleNavigation('/faculty/internal-marks')}
          >
            Add Internal Marks
          </button>
          <button 
            className="bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 transition"
            onClick={() => handleNavigation('/faculty/assignments/create')}
          >
            Create Assignment
          </button>
          <button 
            className="bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition"
            onClick={() => handleNavigation('/faculty/study-materials/upload')}
          >
            Upload Study Material
          </button>
          <button 
            className="bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition"
            onClick={() => handleNavigation('/faculty/notes/pending')}
          >
            Review Pending Notes ({stats.pendingNotes})
          </button>
          <button 
            className="bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition"
            onClick={() => handleNavigation('/faculty/assignments/submissions')}
          >
            Grade Assignment Submissions
          </button>
        </div>
      </div>
      
      {/* Assigned Subjects */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Assigned Subjects</h2>
        {assignedSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedSubjects.map((facultySubject) => (
              <div key={facultySubject.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{facultySubject.subject_name || facultySubject.subject?.name}</h3>
                <p className="text-gray-600">Code: {facultySubject.subject?.code}</p>
                <p className="text-gray-600">Batch: {facultySubject.batch}</p>
                <button 
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => handleNavigation(`/faculty/subjects/${facultySubject.id}/students`)}
                >
                  View Students →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No subjects assigned yet.</p>
        )}
      </div>
      
      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center p-3 bg-yellow-50 rounded">
                <FaFileAlt className="text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium">Notes Pending Review</p>
                  <p className="text-sm text-gray-600">{activity.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
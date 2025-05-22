import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBook, FaClipboardList, FaFileAlt, FaExclamationTriangle } from 'react-icons/fa';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Welcome Card */}
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user?.first_name || 'Student'}!</h2>
          <p className="text-gray-600">
            You have 0 pending assignments and your overall attendance is 0%.
          </p>
        </div>
        
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <FaBook className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-500">Current Subjects</p>
                <p className="font-semibold text-lg">0</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaClipboardList className="text-yellow-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-500">Pending Assignments</p>
                <p className="font-semibold text-lg">0</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaFileAlt className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-500">Uploaded Notes</p>
                <p className="font-semibold text-lg">0</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="font-semibold text-lg">0%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition">
            View Attendance
          </button>
          <button className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition">
            Check Internal Marks
          </button>
          <button className="bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 transition">
            View Assignments
          </button>
          <button className="bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition">
            Access Study Materials
          </button>
          <button className="bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition">
            Upload Notes
          </button>
          <button className="bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition">
            View Timetable
          </button>
        </div>
      </div>
      
      {/* Pending Assignments (Placeholder) */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Assignments</h2>
        <p className="text-gray-500 italic">No pending assignments.</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
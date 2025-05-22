import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    user_type: 'student',
    // Student fields
    student_id: '',
    batch: '',
    semester: '',
    // Faculty fields
    faculty_id: '',
    department: '',
    designation: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (formData.password !== formData.confirm_password) {
      setError("Passwords don't match");
      return;
    }
    
    // Prepare data based on user type
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number,
      user_type: formData.user_type
    };
    
    // Add profile data based on user type
    if (formData.user_type === 'student') {
      userData.student_profile = {
        student_id: formData.student_id,
        batch: formData.batch,
        semester: parseInt(formData.semester)
      };
    } else if (formData.user_type === 'faculty') {
      userData.faculty_profile = {
        faculty_id: formData.faculty_id,
        department: formData.department,
        designation: formData.designation
      };
    }
    
    setLoading(true);
    
    try {
      await register(userData);
      router.push('/login?registered=true');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, don't render the form
  if (isAuthenticated()) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Register for EESA</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="first_name" className="block text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="last_name" className="block text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="username" className="block text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirm_password" className="block text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="phone_number" className="block text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="user_type" className="block text-gray-700 mb-2">
                  User Type
                </label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>
            
            {/* Conditional fields based on user type */}
            {formData.user_type === 'student' && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">Student Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="student_id" className="block text-gray-700 mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      id="student_id"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="batch" className="block text-gray-700 mb-2">
                      Batch (e.g., 2022-2026)
                    </label>
                    <input
                      type="text"
                      id="batch"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="semester" className="block text-gray-700 mb-2">
                      Current Semester
                    </label>
                    <input
                      type="number"
                      id="semester"
                      name="semester"
                      min="1"
                      max="8"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            {formData.user_type === 'faculty' && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">Faculty Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="faculty_id" className="block text-gray-700 mb-2">
                      Faculty ID
                    </label>
                    <input
                      type="text"
                      id="faculty_id"
                      name="faculty_id"
                      value={formData.faculty_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="designation" className="block text-gray-700 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      id="designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
          
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login">
              <span className="text-blue-600 hover:underline cursor-pointer">Login</span>
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
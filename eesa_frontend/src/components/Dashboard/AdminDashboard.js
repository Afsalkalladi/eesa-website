import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaBook, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import { useRouter } from 'next/router';
import axios from 'axios';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    subjects: 0,
    notes: 0,
    events: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [pendingNotes, setPendingNotes] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // For student/faculty registration
  const [registerData, setRegisterData] = useState({
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
  
  const router = useRouter();

  const fetchDashboardData = async () => {
  try {
    // Fetch statistics from API endpoints
    const [studentsRes, facultyRes, subjectsRes, notesRes, eventsRes] = await Promise.all([
      api.get('/users/students/').catch(() => []),
      api.get('/users/faculty/').catch(() => []),
      api.get('/academics/subjects/').catch(() => []),
      api.get('/library/notes/').catch(() => []),
      api.get('/events/events/').catch(() => [])
    ]);

    setStats({
      students: Array.isArray(studentsRes) ? studentsRes.length : 0,
      faculty: Array.isArray(facultyRes) ? facultyRes.length : 0,
      subjects: Array.isArray(subjectsRes) ? subjectsRes.length : 0,
      notes: Array.isArray(notesRes) ? notesRes.length : 0,
      events: Array.isArray(eventsRes) ? eventsRes.length : 0
    });

    // Save faculty and subject lists for later use
    if (Array.isArray(facultyRes)) {
      setFacultyList(facultyRes);
    }
    if (Array.isArray(subjectsRes)) {
      setSubjectList(subjectsRes);
    }

    // This is important: Get fresh data for pending notes
    try {
      const pendingNotesRes = await axios.get(
        'http://localhost:8000/api/library/notes/', 
        {
          params: { status: 'pending' },
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (pendingNotesRes.data && Array.isArray(pendingNotesRes.data)) {
        setPendingNotes(pendingNotesRes.data);
        console.log('Updated pending notes:', pendingNotesRes.data);
      } else {
        setPendingNotes([]);
      }
    } catch (error) {
      console.error('Error fetching pending notes:', error);
      setPendingNotes([]);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    showFeedback('error', 'Failed to load dashboard data. Please refresh the page.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show feedback message and auto-clear after delay
  const showFeedback = (type, message, duration = 3000) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback({ type: '', message: '' });
    }, duration);
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle register form field changes
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  // Open modal with specific type
  const openModal = (type) => {
    setModalType(type);
    // Initialize form data based on modal type
    switch(type) {
      case 'createSubject':
        setFormData({ code: '', name: '', semester: '', description: '' });
        break;
      case 'createEvent':
        setFormData({ title: '', date: '', location: '', description: '' });
        break;
      case 'assignSubject':
        setFormData({ faculty_id: '', subject_id: '', batch: '' });
        break;
      case 'addStudent':
        setRegisterData({
          ...registerData,
          user_type: 'student',
          username: '',
          email: '',
          password: '',
          confirm_password: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          student_id: '',
          batch: '',
          semester: ''
        });
        break;
      case 'addFaculty':
        setRegisterData({
          ...registerData,
          user_type: 'faculty',
          username: '',
          email: '',
          password: '',
          confirm_password: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          faculty_id: '',
          department: '',
          designation: ''
        });
        break;
      default:
        setFormData({});
    }
    setShowModal(true);
  };

  // Handle quick action clicks
  const handleAddStudent = () => {
    openModal('addStudent');
  };

  const handleAddFaculty = () => {
    openModal('addFaculty');
  };

  const handleCreateSubject = () => {
    openModal('createSubject');
  };

  const handleApprovePendingNotes = () => {
    openModal('approveNotes');
  };

  const handleCreateEvent = () => {
    openModal('createEvent');
  };

  const handleManageFacultySubjects = () => {
    openModal('assignSubject');
  };

  // Handle form submissions
  const handleSubmitForm = async () => {
    setFormSubmitting(true);
    
    try {
      switch(modalType) {
        case 'createSubject':
          await createSubject();
          break;
        case 'createEvent':
          await createEvent();
          break;
        case 'assignSubject':
          await assignSubjectToFaculty();
          break;
        case 'addStudent':
        case 'addFaculty':
          await registerUser();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showFeedback('error', `Failed to submit: ${error.message || 'Unknown error'}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Register new user (student or faculty)
  const registerUser = async () => {
    // Validate required fields
    if (!registerData.username || !registerData.email || !registerData.password || 
        !registerData.confirm_password || !registerData.first_name || !registerData.last_name) {
      showFeedback('error', 'Please fill all required fields');
      return;
    }

    // Validate password match
    if (registerData.password !== registerData.confirm_password) {
      showFeedback('error', 'Passwords do not match');
      return;
    }

    // Validate student/faculty specific fields
    if (registerData.user_type === 'student') {
      if (!registerData.student_id || !registerData.batch || !registerData.semester) {
        showFeedback('error', 'Please fill all student information fields');
        return;
      }
    } else if (registerData.user_type === 'faculty') {
      if (!registerData.faculty_id || !registerData.department || !registerData.designation) {
        showFeedback('error', 'Please fill all faculty information fields');
        return;
      }
    }

    try {
      // Prepare data for API
      const userData = {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        confirm_password: registerData.confirm_password,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        phone_number: registerData.phone_number,
        user_type: registerData.user_type
      };

      // Add profile data based on user type
      if (registerData.user_type === 'student') {
        userData.student_profile = {
          student_id: registerData.student_id,
          batch: registerData.batch,
          semester: parseInt(registerData.semester)
        };
      } else if (registerData.user_type === 'faculty') {
        userData.faculty_profile = {
          faculty_id: registerData.faculty_id,
          department: registerData.department,
          designation: registerData.designation
        };
      }

      // Send API request to register user
      await api.post('/users/register/', userData);
      
      // Close modal and show success message
      setShowModal(false);
      showFeedback('success', `${registerData.user_type === 'student' ? 'Student' : 'Faculty'} "${registerData.first_name} ${registerData.last_name}" registered successfully!`);
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error registering user:', error);
      showFeedback('error', `Failed to register ${registerData.user_type}. Please try again.`);
    }
  };

  // Create a new subject
  const createSubject = async () => {
    // Validate required fields
    if (!formData.code || !formData.name || !formData.semester) {
      showFeedback('error', 'Please fill all required fields');
      return;
    }

    try {
      // Convert semester to integer
      const subjectData = {
        ...formData,
        semester: parseInt(formData.semester)
      };

      // Send API request to create subject
      await api.post('/academics/subjects/', subjectData);
      
      // Close modal and show success message
      setShowModal(false);
      showFeedback('success', `Subject "${formData.name}" created successfully!`);
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating subject:', error);
      showFeedback('error', 'Failed to create subject. Please try again.');
    }
  };

  // Create a new event
  const createEvent = async () => {
    // Validate required fields
    if (!formData.title || !formData.date || !formData.location) {
      showFeedback('error', 'Please fill all required fields');
      return;
    }

    try {
      // Send API request to create event
      await api.post('/events/events/', formData);
      
      // Close modal and show success message
      setShowModal(false);
      showFeedback('success', `Event "${formData.title}" created successfully!`);
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating event:', error);
      showFeedback('error', 'Failed to create event. Please try again.');
    }
  };

  // Assign subject to faculty
  const assignSubjectToFaculty = async () => {
    // Validate required fields
    if (!formData.faculty_id || !formData.subject_id || !formData.batch) {
      showFeedback('error', 'Please fill all required fields');
      return;
    }

    try {
      // Send API request to assign subject
      await api.post('/academics/faculty-subjects/', {
        faculty: formData.faculty_id,
        subject: formData.subject_id,
        batch: formData.batch
      });
      
      // Close modal and show success message
      setShowModal(false);
      showFeedback('success', 'Subject assigned to faculty successfully!');
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error assigning subject:', error);
      showFeedback('error', 'Failed to assign subject. Please try again.');
    }
  };

  // Approve or reject a note
  // Alternative implementation using put/patch instead of custom action
// Update this function in the AdminDashboard component
const handleNoteReview = async (noteId, status, comment = '') => {
  try {
    setFormSubmitting(true);
    
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      showFeedback('error', 'You must be logged in to approve notes.');
      return;
    }
    
    // Try both methods to ensure compatibility with your backend
    try {
      // First try with the custom 'review' endpoint
      await axios.post(
        `http://localhost:8000/api/library/notes/${noteId}/review/`, 
        {
          status,
          review_comment: comment
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        }
      );
    } catch (innerError) {
      console.log('Custom review endpoint failed, trying direct update:', innerError);
      
      // Fallback to direct update if the custom endpoint fails
      await axios.patch(
        `http://localhost:8000/api/library/notes/${noteId}/`, 
        {
          status,
          review_comment: comment
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        }
      );
    }
    
    // Show success message
    showFeedback('success', `Note ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
    
    // Important: Remove the approved/rejected note from the local state
    const updatedPendingNotes = pendingNotes.filter(note => note.id !== noteId);
    setPendingNotes(updatedPendingNotes);
    
    // Fetch fresh data to ensure our counts and lists are accurate
    fetchDashboardData();
    
    // If no more pending notes, close the modal
    if (updatedPendingNotes.length === 0) {
      setShowModal(false);
    }
  } catch (error) {
    console.error('Error reviewing note:', error);
    let errorMessage = 'Failed to process note. Please try again.';
    
    if (error.response) {
      console.error('Error response:', error.response);
      if (error.response.status === 403) {
        errorMessage = 'You do not have permission to approve notes. Please make sure you are logged in as admin or faculty.';
      } else if (error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
    }
    
    showFeedback('error', errorMessage);
  } finally {
    setFormSubmitting(false);
  }
};
  // Render modal content based on type
  const renderModalContent = () => {
    switch(modalType) {
      case 'addStudent':
        return (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-firstname">First Name *</label>
                <input 
                  id="register-firstname" 
                  name="first_name"
                  value={registerData.first_name}
                  onChange={handleRegisterInputChange}
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-lastname">Last Name *</label>
                <input 
                  id="register-lastname" 
                  name="last_name"
                  value={registerData.last_name}
                  onChange={handleRegisterInputChange}
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-username">Username *</label>
                <input 
                  id="register-username" 
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterInputChange}
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-email">Email *</label>
                <input 
                  id="register-email" 
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterInputChange}
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-password">Password *</label>
                <input 
                  id="register-password" 
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterInputChange}
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-confirm-password">Confirm Password *</label>
                <input 
                  id="register-confirm-password" 
                  name="confirm_password"
                  value={registerData.confirm_password}
                  onChange={handleRegisterInputChange}
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="register-phone">Phone Number</label>
              <input 
                id="register-phone" 
                name="phone_number"
                value={registerData.phone_number}
                onChange={handleRegisterInputChange}
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="10-digit phone number"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-lg mb-3">Student Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="register-student-id">Student ID *</label>
                  <input 
                    id="register-student-id" 
                    name="student_id"
                    value={registerData.student_id}
                    onChange={handleRegisterInputChange}
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="register-batch">Batch *</label>
                  <input 
                    id="register-batch" 
                    name="batch"
                    value={registerData.batch}
                    onChange={handleRegisterInputChange}
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 2022-2026"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="register-semester">Semester *</label>
                  <select
                    id="register-semester" 
                    name="semester"
                    value={registerData.semester}
                    onChange={handleRegisterInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600"
                onClick={() => setShowModal(false)}
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleSubmitForm}
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Registering...' : 'Register Student'}
              </button>
            </div>
          </div>
        );
        
      case 'addFaculty':
        return (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-firstname">First Name *</label>
                <input 
                  id="register-firstname" 
                  name="first_name"
                  value={registerData.first_name}
                  onChange={handleRegisterInputChange}
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-lastname">Last Name *</label>
                <input 
                  id="register-lastname" 
                  name="last_name"
                  value={registerData.last_name}
                  onChange={handleRegisterInputChange}
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-username">Username *</label>
                <input 
                  id="register-username" 
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterInputChange}
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-email">Email *</label>
                <input 
                  id="register-email" 
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterInputChange}
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-password">Password *</label>
                <input 
                  id="register-password" 
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterInputChange}
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="register-confirm-password">Confirm Password *</label>
                <input 
                  id="register-confirm-password" 
                  name="confirm_password"
                  value={registerData.confirm_password}
                  onChange={handleRegisterInputChange}
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="register-phone">Phone Number</label>
              <input 
                id="register-phone" 
                name="phone_number"
                value={registerData.phone_number}
                onChange={handleRegisterInputChange}
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="10-digit phone number"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-lg mb-3">Faculty Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="register-faculty-id">Faculty ID *</label>
                  <input 
                    id="register-faculty-id" 
                    name="faculty_id"
                    value={registerData.faculty_id}
                    onChange={handleRegisterInputChange}
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="register-department">Department *</label>
                  <input 
                    id="register-department" 
                    name="department"
                    value={registerData.department}
                    onChange={handleRegisterInputChange}
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="register-designation">Designation *</label>
                  <input 
                    id="register-designation" 
                    name="designation"
                    value={registerData.designation}
                    onChange={handleRegisterInputChange}
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Assistant Professor"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600"
                onClick={() => setShowModal(false)}
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleSubmitForm}
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Registering...' : 'Register Faculty'}
              </button>
            </div>
          </div>
        );
        
      case 'createSubject':
        return (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="code">Subject Code *</label>
              <input 
                id="code" 
                name="code"
                value={formData.code || ''}
                onChange={handleInputChange}
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., CS101"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">Subject Name *</label>
              <input 
                id="name" 
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Introduction to Computer Science"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="semester">Semester *</label>
              <select 
                id="semester" 
                name="semester"
                value={formData.semester || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="description">Description</label>
              <textarea 
                id="description" 
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Enter subject description..."
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600"
                onClick={() => setShowModal(false)}
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleSubmitForm}
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </div>
        );
        
      case 'createEvent':
        return (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="title">Event Title *</label>
              <input 
                id="title" 
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter event title"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="date">Date & Time *</label>
              <input 
                id="date" 
                name="date"
                value={formData.date || ''}
                onChange={handleInputChange}
                type="datetime-local" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="location">Location *</label>
              <input 
                id="location" 
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter event location"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="description">Description</label>
              <textarea 
                id="description" 
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Enter event description..."
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600"
                onClick={() => setShowModal(false)}
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleSubmitForm}
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        );
        
      case 'assignSubject':
        return (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="faculty_id">Faculty *</label>
              <select 
                id="faculty_id" 
                name="faculty_id"
                value={formData.faculty_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Faculty</option>
                {facultyList.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.user?.first_name} {faculty.user?.last_name} ({faculty.designation})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="subject_id">Subject *</label>
              <select 
                id="subject_id" 
                name="subject_id"
                value={formData.subject_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Subject</option>
                {subjectList.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code}: {subject.name} (Semester {subject.semester})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="batch">Batch *</label>
              <input 
                id="batch" 
                name="batch"
                value={formData.batch || ''}
                onChange={handleInputChange}
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 2022-2026"
                required
              />
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600"
                onClick={() => setShowModal(false)}
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleSubmitForm}
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Assigning...' : 'Assign Subject'}
              </button>
            </div>
          </div>
        );
        
      case 'approveNotes':
        return (
          <div className="p-4">
            {pendingNotes.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No pending notes for approval at this time.</p>
                <button 
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              pendingNotes.map(note => (
                <div key={note.id} className="border-b pb-4 mb-4">
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">Subject: {note.subject}</p>
                  <p className="text-sm text-gray-600 mb-2">Uploaded by: {note.uploaded_by_name}</p>
                  <p className="text-sm mb-3">{note.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <a 
                      href={`http://localhost:8000${note.file}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View File
                    </a>
                    
                    <div className="ml-auto flex gap-2">
                      <button 
                        onClick={() => handleNoteReview(note.id, 'rejected', 'Does not meet quality standards')}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleNoteReview(note.id, 'approved')}
                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <div className="flex justify-end mt-4">
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch(modalType) {
      case 'createSubject': return 'Create New Subject';
      case 'createEvent': return 'Create New Event';
      case 'assignSubject': return 'Assign Subject to Faculty';
      case 'approveNotes': return 'Pending Notes for Approval';
      case 'addStudent': return 'Register New Student';
      case 'addFaculty': return 'Register New Faculty';
      default: return '';
    }
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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Feedback message */}
      {actionFeedback.message && (
        <div className={`mb-6 p-4 rounded ${
          actionFeedback.type === 'success' ? 'bg-green-100 text-green-700' : 
          actionFeedback.type === 'error' ? 'bg-red-100 text-red-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {actionFeedback.message}
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow flex items-center">
          <FaUsers className="text-blue-600 text-3xl mr-3" />
          <div>
            <h3 className="text-gray-500 text-sm">Total Students</h3>
            <p className="text-2xl font-semibold">{stats.students}</p>
          </div>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg shadow flex items-center">
          <FaChalkboardTeacher className="text-green-600 text-3xl mr-3" />
          <div>
            <h3 className="text-gray-500 text-sm">Total Faculty</h3>
            <p className="text-2xl font-semibold">{stats.faculty}</p>
          </div>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded-lg shadow flex items-center">
          <FaBook className="text-yellow-600 text-3xl mr-3" />
          <div>
            <h3 className="text-gray-500 text-sm">Total Subjects</h3>
            <p className="text-2xl font-semibold">{stats.subjects}</p>
          </div>
        </div>
        
        <div className="bg-purple-100 p-4 rounded-lg shadow flex items-center">
          <FaUserGraduate className="text-purple-600 text-3xl mr-3" />
          <div>
            <h3 className="text-gray-500 text-sm">Study Materials</h3>
            <p className="text-2xl font-semibold">{stats.notes}</p>
          </div>
        </div>
        
        <div className="bg-red-100 p-4 rounded-lg shadow flex items-center">
          <FaCalendarAlt className="text-red-600 text-3xl mr-3" />
          <div>
            <h3 className="text-gray-500 text-sm">Total Events</h3>
            <p className="text-2xl font-semibold">{stats.events}</p>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={handleAddStudent}
            className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
          >
            <FaUsers className="mr-2" /> Add New Student
          </button>
          
          <button 
            onClick={handleAddFaculty}
            className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition flex items-center justify-center"
          >
            <FaChalkboardTeacher className="mr-2" /> Add New Faculty
          </button>
          
          <button 
            onClick={handleCreateSubject}
            className="bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 transition flex items-center justify-center"
          >
            <FaBook className="mr-2" /> Create New Subject
          </button>
          
          <button 
            onClick={handleApprovePendingNotes}
            className="bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition flex items-center justify-center"
            disabled={pendingNotes.length === 0}
            title={pendingNotes.length === 0 ? "No pending notes to approve" : ""}
          >
            <FaUserGraduate className="mr-2" /> Approve Pending Notes
            {pendingNotes.length > 0 && (
              <span className="ml-2 bg-white text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {pendingNotes.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={handleCreateEvent}
            className="bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition flex items-center justify-center"
          >
            <FaCalendarAlt className="mr-2" /> Create New Event
          </button>
          
          <button 
            onClick={handleManageFacultySubjects}
            className="bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
          >
            <FaChalkboardTeacher className="mr-2" /> Manage Faculty Subjects
          </button>
        </div>
      </div>
      
      {/* Recent Activity (Placeholder) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="border-b pb-2 mb-2">
          <p className="text-gray-600">This section will display recent system activities</p>
        </div>
        <p className="text-gray-500 italic">No recent activities to display</p>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">{getModalTitle()}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={formSubmitting}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { register } from '../../services/authService';

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  phone_number: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  user_type: Yup.string()
    .oneOf(['student', 'faculty'], 'Invalid user type')
    .required('User type is required'),
  student_id: Yup.string().when('user_type', {
    is: 'student',
    then: Yup.string().required('Student ID is required'),
  }),
  batch: Yup.string().when('user_type', {
    is: 'student',
    then: Yup.string().required('Batch is required'),
  }),
  semester: Yup.number().when('user_type', {
    is: 'student',
    then: Yup.number().required('Semester is required').min(1).max(8),
  }),
  faculty_id: Yup.string().when('user_type', {
    is: 'faculty',
    then: Yup.string().required('Faculty ID is required'),
  }),
  department: Yup.string().when('user_type', {
    is: 'faculty',
    then: Yup.string().required('Department is required'),
  }),
  designation: Yup.string().when('user_type', {
    is: 'faculty',
    then: Yup.string().required('Designation is required'),
  }),
});

const RegisterForm = () => {
  const router = useRouter();
  const [registerError, setRegisterError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Prepare data based on user type
      const userData = {
        username: values.username,
        email: values.email,
        password: values.password,
        confirm_password: values.confirm_password,
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        user_type: values.user_type,
      };

      if (values.user_type === 'student') {
        userData.student_profile = {
          student_id: values.student_id,
          batch: values.batch,
          semester: values.semester,
        };
      } else if (values.user_type === 'faculty') {
        userData.faculty_profile = {
          faculty_id: values.faculty_id,
          department: values.department,
          designation: values.designation,
        };
      }

      await register(userData);
      router.push('/login?registered=true');
    } catch (error) {
      setRegisterError(
        typeof error === 'string' 
          ? error 
          : 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Register for EESA</h2>
      
      {registerError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {registerError}
        </div>
      )}
      
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          confirm_password: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          user_type: 'student',
          student_id: '',
          batch: '',
          semester: '',
          faculty_id: '',
          department: '',
          designation: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, errors, touched }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="first_name" className="block text-gray-700 mb-2">
                  First Name
                </label>
                <Field
                  type="text"
                  name="first_name"
                  id="first_name"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.first_name && touched.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="last_name" className="block text-gray-700 mb-2">
                  Last Name
                </label>
                <Field
                  type="text"
                  name="last_name"
                  id="last_name"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.last_name && touched.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="username" className="block text-gray-700 mb-2">
                  Username
                </label>
                <Field
                  type="text"
                  name="username"
                  id="username"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.username && touched.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="confirm_password" className="block text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  name="confirm_password"
                  id="confirm_password"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.confirm_password && touched.confirm_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage
                  name="confirm_password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="phone_number" className="block text-gray-700 mb-2">
                  Phone Number
                </label>
                <Field
                  type="text"
                  name="phone_number"
                  id="phone_number"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.phone_number && touched.phone_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage
                  name="phone_number"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="user_type" className="block text-gray-700 mb-2">
                  User Type
                </label>
                <Field
                  as="select"
                  name="user_type"
                  id="user_type"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.user_type && touched.user_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </Field>
                <ErrorMessage
                  name="user_type"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>
            
            {/* Conditional fields based on user type */}
            {values.user_type === 'student' && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">Student Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="student_id" className="block text-gray-700 mb-2">
                      Student ID
                    </label>
                    <Field
                      type="text"
                      name="student_id"
                      id="student_id"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.student_id && touched.student_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage
                      name="student_id"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="batch" className="block text-gray-700 mb-2">
                      Batch (e.g., 2022-2026)
                    </label>
                    <Field
                      type="text"
                      name="batch"
                      id="batch"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.batch && touched.batch ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage
                      name="batch"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="semester" className="block text-gray-700 mb-2">
                      Current Semester
                    </label>
                    <Field
                      type="number"
                      name="semester"
                      id="semester"
                      min="1"
                      max="8"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.semester && touched.semester ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage
                      name="semester"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {values.user_type === 'faculty' && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">Faculty Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="faculty_id" className="block text-gray-700 mb-2">
                      Faculty ID
                    </label>
                    <Field
                      type="text"
                      name="faculty_id"
                      id="faculty_id"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.faculty_id && touched.faculty_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage
                      name="faculty_id"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-gray-700 mb-2">
                      Department
                    </label>
                    <Field
                      type="text"
                      name="department"
                      id="department"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.department && touched.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage
                      name="department"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="designation" className="block text-gray-700 mb-2">
                      Designation
                    </label>
                    <Field
                      type="text"
                      name="designation"
                      id="designation"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.designation && touched.designation ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage
                      name="designation"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
      
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login">
          <span className="text-blue-600 hover:underline cursor-pointer">Login</span>
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
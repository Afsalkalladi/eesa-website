import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginForm = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values);
      router.push('/dashboard');
    } catch (error) {
      setLoginError(error.toString());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to EESA</h2>
      
      {loginError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {loginError}
        </div>
      )}
      
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <div className="mb-4">
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
            
            <div className="mb-6">
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
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
      
      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{' '}
        <Link href="/register">
          <span className="text-blue-600 hover:underline cursor-pointer">Register</span>
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
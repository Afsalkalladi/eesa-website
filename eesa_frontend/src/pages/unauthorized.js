import React from 'react';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <span className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition cursor-pointer">
              Go to Dashboard
            </span>
          </Link>
          <Link href="/">
            <span className="bg-gray-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 transition cursor-pointer">
              Home Page
            </span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Unauthorized;
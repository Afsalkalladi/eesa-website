import React from 'react';
import Layout from '../components/Layout/Layout';
import { FaUsers, FaGraduationCap, FaLaptopCode, FaFlask } from 'react-icons/fa';

export default function About() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">About EESA Department</h1>
        
        {/* Department Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Department Overview</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">
              The Electrical and Electronics Engineering Department is committed to providing high-quality education
              and fostering innovation in the field of electrical engineering. Our department offers comprehensive
              programs that blend theoretical knowledge with practical applications.
            </p>
            <p className="text-gray-700 mb-4">
              Established in [Year], our department has grown to become one of the leading centers for electrical
              engineering education and research. We pride ourselves on our state-of-the-art laboratories,
              experienced faculty, and strong industry connections.
            </p>
            <p className="text-gray-700">
              The Electrical and Electronics Engineering Student Association (EESA) works closely with faculty
              and industry partners to organize workshops, seminars, and events that enhance the learning
              experience of our students.
            </p>
          </div>
        </section>
        
        {/* Department Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="mr-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaGraduationCap className="text-blue-600 text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quality Education</h3>
                <p className="text-gray-700">
                  Our curriculum is designed to provide students with a strong foundation in electrical
                  engineering principles while keeping up with the latest industry trends and technologies.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="mr-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FaLaptopCode className="text-green-600 text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Practical Training</h3>
                <p className="text-gray-700">
                  We emphasize hands-on learning through well-equipped laboratories, project work,
                  and internships with leading companies in the industry.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="mr-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaFlask className="text-purple-600 text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Research Opportunities</h3>
                <p className="text-gray-700">
                  Students have the opportunity to engage in cutting-edge research projects under
                  the guidance of experienced faculty members.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="mr-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <FaUsers className="text-red-600 text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Student Community</h3>
                <p className="text-gray-700">
                  EESA fosters a vibrant student community through various events, competitions,
                  and collaborative projects that enhance personal and professional growth.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Faculty Directory */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Faculty Directory</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample faculty members - replace with actual data from API */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">Dr. John Smith</h3>
                  <p className="text-gray-600">Professor</p>
                  <p className="text-gray-600">Department Head</p>
                  <p className="text-sm text-blue-600 mt-2">email@example.com</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">Dr. Jane Doe</h3>
                  <p className="text-gray-600">Associate Professor</p>
                  <p className="text-gray-600">Power Systems</p>
                  <p className="text-sm text-blue-600 mt-2">email@example.com</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">Prof. Robert Johnson</h3>
                  <p className="text-gray-600">Assistant Professor</p>
                  <p className="text-gray-600">Electronics</p>
                  <p className="text-sm text-blue-600 mt-2">email@example.com</p>
                </div>
              </div>
            </div>
            
            <p className="mt-6 text-center text-gray-600">
              To view the complete faculty directory, please visit the department office or contact the administrator.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
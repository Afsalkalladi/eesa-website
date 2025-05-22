import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../services/api'; 
import axios from 'axios';
import { FaCalendarAlt, FaBook, FaLightbulb } from 'react-icons/fa';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the API service to get data
        const eventsData = await api.get('/events/events/');
        setEvents(eventsData.slice(0, 3)); // Get first 3 events
        
        const projectsData = await api.get('/events/projects/');
        setProjects(projectsData.slice(0, 4)); // Get first 4 projects
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg mx-auto">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-20 px-4 rounded-lg mb-12">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to EESA Department
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Electrical and Electronics Engineering Student Association
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/login"
              className="bg-white text-blue-700 px-6 py-3 rounded-md font-bold hover:bg-blue-50 transition"
            >
              Login
            </a>
            <a
              href="/about"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-bold hover:bg-white hover:text-blue-700 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 mb-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What We Offer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaBook className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Study Resources</h3>
              <p className="text-gray-600">
                Access a comprehensive library of notes, materials, and resources for all subjects.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Events & Activities</h3>
              <p className="text-gray-600">
                Stay updated with department events, workshops, seminars, and activities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-purple-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaLightbulb className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Project Showcase</h3>
              <p className="text-gray-600">
                Explore innovative projects developed by students and faculty in the department.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-12 bg-gray-50 rounded-lg mb-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Upcoming Events
          </h2>
          
          {loading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white p-6 rounded-lg shadow-md">
                  {event.image && (
                    <img 
                      src={`http://localhost:8000${event.image}`} 
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaCalendarAlt className="mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <a 
                    href={`/events/${event.id}`}
                    className="text-blue-600 font-medium hover:text-blue-800"
                  >
                    Learn More →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No upcoming events at the moment. Check back soon!
            </div>
          )}
          
          <div className="text-center mt-8">
            <a 
              href="/events"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              View All Events
            </a>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-12 mb-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Featured Projects
          </h2>
          
          {loading ? (
            <div className="text-center py-8">Loading projects...</div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6">
                  {project.image ? (
                    <img 
                      src={`http://localhost:8000${project.image}`} 
                      alt={project.title}
                      className="w-full md:w-1/3 h-48 md:h-auto object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-200 rounded-md flex items-center justify-center">
                      <FaLightbulb className="text-gray-400 text-4xl" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    {project.contributors_names && project.contributors_names.length > 0 && (
                      <div className="text-sm text-gray-500 mb-4">
                        <span className="font-medium">Contributors:</span>{' '}
                        {project.contributors_names.join(', ')}
                      </div>
                    )}
                    <div className="flex gap-4">
                      <a 
                        href={`/projects/${project.id}`}
                        className="text-blue-600 font-medium hover:text-blue-800"
                      >
                        Learn More →
                      </a>
                      {project.github_link && (
                        <a 
                          href={project.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 font-medium hover:text-gray-900"
                        >
                          GitHub Repository →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No projects to display at the moment.
            </div>
          )}
          
          <div className="text-center mt-8">
            <a 
              href="/projects"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              View All Projects
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-700 text-white rounded-lg">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join EESA Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with faculty, access study materials, and stay updated with the latest department events.
          </p>
          <a 
            href="/register"
            className="bg-white text-blue-700 px-8 py-3 rounded-md font-bold hover:bg-blue-50 transition"
          >
            Register Now
          </a>
        </div>
      </section>
    </Layout>
  );
}
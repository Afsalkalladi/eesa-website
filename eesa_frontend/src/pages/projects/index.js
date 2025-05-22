import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import api from '../../services/api';
import { FaLightbulb, FaCode, FaGithub, FaUser } from 'react-icons/fa';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.get('/events/projects/');
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Department Projects</h1>
        
        <p className="text-gray-600 mb-8 max-w-3xl">
          Explore innovative projects developed by students and faculty in the Electrical and Electronics Engineering department. 
          These projects showcase the practical application of theoretical knowledge and creativity.
        </p>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg mx-auto">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {projects.map(project => (
              <div key={project.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row">
                  {project.image ? (
                    <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
                      <img 
                        src={`http://localhost:8000${project.image}`} 
                        alt={project.title}
                        className="w-full h-48 md:h-full object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6 bg-gray-200 rounded-md flex items-center justify-center h-48">
                      <FaLightbulb className="text-gray-400 text-4xl" />
                    </div>
                  )}
                  
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                    
                    <p className="text-gray-700 mb-4">{project.description}</p>
                    
                    {project.contributors_names && project.contributors_names.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-1">Contributors:</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.contributors_names.map((contributor, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              <FaUser className="mr-1" />
                              {contributor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {project.github_link && (
                      <a 
                        href={project.github_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FaGithub className="mr-1" /> View on GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaLightbulb className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-600">No projects available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
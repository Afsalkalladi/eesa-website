import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import api from '../../services/api';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.get('/events/events/');
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg mx-auto">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-8">
            {events.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col md:flex-row">
                {event.image ? (
                  <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-6">
                    <img 
                      src={`http://localhost:8000${event.image}`} 
                      alt={event.title}
                      className="w-full h-48 md:h-full object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-6 bg-gray-200 rounded-md flex items-center justify-center h-48">
                    <FaCalendarAlt className="text-gray-400 text-4xl" />
                  </div>
                )}
                
                <div className="md:w-3/4">
                  <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
                  
                  <div className="flex flex-wrap items-center mb-4 text-gray-600">
                    <div className="flex items-center mr-6 mb-2">
                      <FaCalendarAlt className="mr-2" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center mr-6 mb-2">
                      <FaClock className="mr-2" />
                      <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{event.description}</p>
                  
                  {event.organizer_name && (
                    <p className="text-sm text-gray-500">
                      Organized by: {event.organizer_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaCalendarAlt className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-600">No upcoming events at the moment. Check back soon!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TestEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestTime, setRequestTime] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching events...');
        const startTime = new Date();
        
        // Use the exact URL we confirmed works in the browser
        const response = await axios.get('http://localhost:8000/api/events/events/');
        
        const endTime = new Date();
        setRequestTime(endTime - startTime);
        
        console.log('Response received:', response.data);
        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Events Page</h1>
      
      {loading && <p className="mb-4">Loading events...</p>}
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold mb-2">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      {requestTime && (
        <p className="mb-4 text-gray-600">
          Request completed in {requestTime}ms
        </p>
      )}
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <p>API URL: http://localhost:8000/api/events/events/</p>
        <p>Total events: {events.length}</p>
      </div>
      
      <h2 className="text-xl font-bold mb-2">Events:</h2>
      
      {events.length > 0 ? (
        <ul className="border border-gray-300 rounded divide-y">
          {events.map(event => (
            <li key={event.id} className="p-4">
              <h3 className="font-bold">{event.title}</h3>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString()} at {event.location}
              </p>
              <p className="mt-2">{event.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        !loading && !error && (
          <p className="text-gray-500">No events found. Try creating some events in your Django admin.</p>
        )
      )}
    </div>
  );
}
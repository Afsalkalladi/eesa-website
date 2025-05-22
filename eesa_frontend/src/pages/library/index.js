import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import api from '../../services/api';
import { FaBook, FaSearch, FaDownload } from 'react-icons/fa';

export default function Library() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await api.get('/library/notes/');
        setNotes(data);
        setFilteredNotes(data);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to load library notes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Filter notes when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.subject.toLowerCase().includes(query) ||
        note.description.toLowerCase().includes(query)
      );
      setFilteredNotes(filtered);
    }
  }, [searchQuery, notes]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">EESA Library</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search notes by title, subject, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading notes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg mx-auto">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div key={note.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaBook className="text-blue-600" />
                  </div>
                  <h2 className="ml-3 text-xl font-semibold">{note.title}</h2>
                </div>
                
                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {note.subject}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {note.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    By {note.uploaded_by_name || 'Anonymous'}
                  </p>
                  
                  <a href={`http://localhost:8000${note.file}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                    <FaDownload className="mr-1" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaBook className="mx-auto text-gray-400 text-5xl mb-4" />
            {searchQuery ? (
              <p className="text-gray-600">No notes found matching "{searchQuery}"</p>
            ) : (
              <p className="text-gray-600">No notes available in the library yet.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
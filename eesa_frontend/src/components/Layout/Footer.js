import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">EESA Department</h3>
            <p className="text-gray-300">
              The Electrical and Electronics Engineering Student Association (EESA) 
              is dedicated to promoting excellence in the field of electrical and 
              electronics engineering.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">
              Email: info@eesa.edu<br />
              Phone: +123-456-7890<br />
              Address: University Campus, Main Building
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="text-gray-300 space-y-2">
              <li><a href="#" className="hover:text-blue-300">Events</a></li>
              <li><a href="#" className="hover:text-blue-300">Projects</a></li>
              <li><a href="#" className="hover:text-blue-300">Library</a></li>
              <li><a href="#" className="hover:text-blue-300">About Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EESA Department. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
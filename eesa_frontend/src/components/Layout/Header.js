import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Function to check if a path is active
  const isActive = (path) => {
    if (path === '/' && router.pathname === '/') {
      return true;
    }
    if (path !== '/' && router.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="text-xl font-bold cursor-pointer">EESA Department</div>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link href="/">
            <div className={`hover:text-blue-200 cursor-pointer ${isActive('/') ? 'text-blue-200 font-semibold' : ''}`}>
              Home
            </div>
          </Link>
          <Link href="/events">
            <div className={`hover:text-blue-200 cursor-pointer ${isActive('/events') ? 'text-blue-200 font-semibold' : ''}`}>
              Events
            </div>
          </Link>
          <Link href="/projects">
            <div className={`hover:text-blue-200 cursor-pointer ${isActive('/projects') ? 'text-blue-200 font-semibold' : ''}`}>
              Projects
            </div>
          </Link>
          <Link href="/library">
            <div className={`hover:text-blue-200 cursor-pointer ${isActive('/library') ? 'text-blue-200 font-semibold' : ''}`}>
              Library
            </div>
          </Link>
          <Link href="/about">
            <div className={`hover:text-blue-200 cursor-pointer ${isActive('/about') ? 'text-blue-200 font-semibold' : ''}`}>
              About
            </div>
          </Link>
          
          {user ? (
            <div className="relative group">
              <div className="flex items-center space-x-1 cursor-pointer">
                <FaUserCircle className="text-xl" />
                <span>{user.first_name}</span>
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <Link href="/dashboard">
                  <div className="block px-4 py-2 text-gray-800 hover:bg-blue-100 cursor-pointer">
                    Dashboard
                  </div>
                </Link>
                <div 
                  onClick={handleLogout} 
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-100 cursor-pointer flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <div className="bg-white text-blue-800 px-4 py-2 rounded-md font-semibold hover:bg-blue-100 cursor-pointer">
                Login
              </div>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
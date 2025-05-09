import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import React, { useRef, useState, useEffect } from 'react';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: -100, y: -100 });
  const [particles, setParticles] = useState([]);
  const [activeLink, setActiveLink] = useState("");
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Set active link based on current path
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/") setActiveLink("home");
    else if (path.includes("/learning-paths")) setActiveLink("learning-paths");
    else if (path.includes("/posts")) setActiveLink("posts");
    else if (path.includes("/create-path")) setActiveLink("create-path");
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add sparkle effect on logo hover
  useEffect(() => {
    const logo = document.querySelector('.logo-container');
    if (!logo) return;
    
    const handleMouseMove = (e) => {
      const rect = logo.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSparklePosition({ x, y });
    };
    
    const handleMouseEnter = () => {
      // Generate particles when hovering the logo
      const newParticles = [];
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: `p-${Date.now()}-${i}`,
          x: Math.random() * 60,
          y: Math.random() * 30,
          size: 2 + Math.random() * 4,
          color: ['#FFC837', '#FF8008', '#F976FF', '#B721FF', '#36D1DC', '#5B86E5'][Math.floor(Math.random() * 6)],
          duration: 1 + Math.random() * 2
        });
      }
      setParticles(newParticles);
    };
    
    logo.addEventListener('mousemove', handleMouseMove);
    logo.addEventListener('mouseenter', handleMouseEnter);
    
    return () => {
      logo.removeEventListener('mousemove', handleMouseMove);
      logo.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Clean up particles after animation
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
    setSearchOpen(false);
    setSearchQuery("");
    // Navigate to search results page or show results in a modal
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white shadow-md text-blue-800' 
        : 'bg-gradient-to-r from-blue-900 to-blue-800 text-white'
    }`}>
      {/* Professional gradient border at top */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link className="flex items-center font-bold text-xl group logo-container relative" to="/">
              {/* Enhanced logo with subtle effects */}
              <div className="sparkle absolute" style={{ 
                left: `${sparklePosition.x}px`, 
                top: `${sparklePosition.y}px`,
                pointerEvents: 'none'
              }}>
                <svg width="24" height="24" viewBox="0 0 20 20" className="animate-ping-slow">
                  <path fill="rgba(220,240,255,0.8)" d="M10 0L12 7L20 10L12 13L10 20L8 13L0 10L8 7L10 0Z" />
                </svg>
              </div>
              
              {/* Animated particles around logo */}
              {particles.map(particle => (
                <div 
                  key={particle.id}
                  className="absolute pointer-events-none animate-float-up opacity-0"
                  style={{
                    left: `${particle.x}px`,
                    top: `${particle.y}px`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    borderRadius: '50%',
                    animation: `floatUpAndFade ${particle.duration}s ease-out forwards`
                  }}
                />
              ))}
              
              <div className={`flex items-center justify-center h-10 w-10 rounded-full mr-2 ${
                scrolled ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white' : 'bg-white text-blue-700'
              } shadow-sm transition-all duration-300 group-hover:scale-110`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform transition-all group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="relative">
                <span className="transition-all duration-300 font-semibold">Skill</span>
                <span className={`font-light ${scrolled ? 'text-blue-600' : 'text-blue-200'}`}>Share</span>
                {/* Simple underline animation */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
          </div>

          {/* Mobile menu button with refined styling */}
          <div className="flex items-center sm:hidden">
            <button 
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md transition-all duration-300
                ${scrolled 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-white hover:bg-blue-800'
                } focus:outline-none`}
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6">
                <span className={`absolute block w-6 h-0.5 transition-all duration-300 ease-in-out ${
                  navbarOpen 
                    ? 'top-2.5 rotate-45' 
                    : 'top-1.5'
                } ${scrolled ? 'bg-blue-600' : 'bg-white'}`}></span>
                <span className={`absolute block w-6 h-0.5 transition-all duration-200 ease-in-out ${
                  navbarOpen 
                    ? 'opacity-0' 
                    : 'opacity-100'
                } top-3 ${scrolled ? 'bg-blue-600' : 'bg-white'}`}></span>
                <span className={`absolute block w-6 h-0.5 transition-all duration-300 ease-in-out ${
                  navbarOpen 
                    ? 'top-2.5 -rotate-45' 
                    : 'top-4.5'
                } ${scrolled ? 'bg-blue-600' : 'bg-white'}`}></span>
              </div>
            </button>
          </div>
          
          {/* Desktop menu with professional styling */}
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:flex-1 ml-6">
            <div className="flex space-x-1">
              {/* Search icon */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  scrolled 
                    ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' 
                    : 'text-white/90 hover:text-white hover:bg-blue-800/60'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Search bar - conditionally rendered */}
              {searchOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-xl rounded-b-lg p-3 transform animate-fadeDown z-50">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative flex-grow">
                      <input
                        type="search"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-l-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        placeholder="Search for learning paths, posts, users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-all shadow-sm"
                    >
                      Search
                    </button>
                  </form>
                </div>
              )}
              
              <Link 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeLink === "home" 
                    ? (scrolled ? 'bg-blue-50 text-blue-800 font-bold' : 'bg-blue-800 text-white font-bold') 
                    : (scrolled 
                      ? 'text-blue-700 hover:text-blue-800 hover:bg-blue-50' 
                      : 'text-white hover:bg-blue-800/60')
                }`} 
                to="/"
                onClick={() => setActiveLink("home")}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className={activeLink === "home" ? "font-bold" : ""}>Home</span>
                </span>
              </Link>
              
              <Link 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeLink === "learning-paths" 
                    ? (scrolled ? 'bg-blue-50 text-blue-800 font-bold' : 'bg-blue-800 text-white font-bold') 
                    : (scrolled 
                      ? 'text-blue-700 hover:text-blue-800 hover:bg-blue-50' 
                      : 'text-white hover:bg-blue-800/60')
                }`} 
                to="/learning-paths"
                onClick={() => setActiveLink("learning-paths")}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className={activeLink === "learning-paths" ? "font-bold" : ""}>Learning Paths</span>
                </span>
              </Link>
              
              <Link 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeLink === "create-path" 
                    ? (scrolled 
                      ? 'bg-blue-50 text-blue-800 font-bold' 
                      : 'bg-blue-800 text-white font-bold') 
                    : (scrolled 
                      ? 'text-blue-700 hover:text-blue-800 hover:bg-blue-50' 
                      : 'text-white hover:bg-blue-800/60')
                }`} 
                to="/create-path"
                onClick={() => setActiveLink("create-path")}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={activeLink === "create-path" ? "font-bold" : ""}>Create Path</span>
                </span>
              </Link>
              
              <Link 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeLink === "posts" 
                    ? (scrolled ? 'bg-blue-50 text-blue-800 font-bold' : 'bg-blue-800 text-white font-bold') 
                    : (scrolled 
                      ? 'text-blue-700 hover:text-blue-800 hover:bg-blue-50' 
                      : 'text-white hover:bg-blue-800/60')
                }`} 
                to="/posts"
                onClick={() => setActiveLink("posts")}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span className={activeLink === "posts" ? "font-bold" : ""}>Community</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              {/* Notifications Icon */}
              {currentUser && (
                <div className="relative">
                  <button className={`p-2 rounded-full transition-all duration-300 ${
                    scrolled 
                      ? 'hover:bg-blue-50 text-blue-700' 
                      : 'hover:bg-blue-800/60 text-white/90'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 bg-blue-400 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">{notificationCount}</span>
                    )}
                  </button>
                </div>
              )}
              
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    className={`flex items-center text-sm font-medium px-3 py-2 rounded-full transition-all duration-300
                    ${scrolled 
                      ? 'bg-blue-50 text-blue-800 hover:bg-blue-100' 
                      : 'bg-blue-800/40 hover:bg-blue-800/60 text-white'
                    }`}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {currentUser.profilePicture ? (
                      <img 
                        src={currentUser.profilePicture} 
                        alt={currentUser.username} 
                        className="rounded-full mr-2 h-7 w-7 object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className={`rounded-full flex items-center justify-center mr-2 h-7 w-7 text-xs font-bold
                        ${scrolled ? 'bg-blue-700 text-white' : 'bg-white text-blue-700'}`}
                      >
                        {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 
                         currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 
                         currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">
                      {currentUser?.username || currentUser?.name || currentUser?.email || 'User'}
                    </span>
                    <svg className={`ml-1.5 h-5 w-5 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} 
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showDropdown && (
                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg 
                      bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-3 px-4 border-b border-gray-100">
                        <div className="flex items-center">
                          {currentUser.profilePicture ? (
                            <img 
                              src={currentUser.profilePicture} 
                              alt={currentUser.username} 
                              className="rounded-full mr-3 h-10 w-10 object-cover border-2 border-blue-100"
                            />
                          ) : (
                            <div className="rounded-full flex items-center justify-center mr-3 h-10 w-10 text-sm font-bold bg-blue-700 text-white">
                              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 
                              currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 
                              currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700">Signed in as</p>
                            <p className="text-sm font-bold text-blue-700 truncate">{currentUser?.username || currentUser?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Your Profile</span>
                        </Link>
                        <Link 
                          to="/learning-progress" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>My Learning Progress</span>
                        </Link>
                        <Link 
                          to="/settings" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link 
                          to="/saved-paths" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          <span>Saved Learning Paths</span>
                        </Link>
                      </div>
                      <div className="py-1 border-t border-gray-100">
                        <button 
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          onClick={handleLogout}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link 
                    to="/login" 
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300
                    ${scrolled 
                      ? 'text-blue-700 hover:text-blue-800 hover:bg-blue-50' 
                      : 'text-white hover:bg-blue-800/60'
                    }`}
                  >
                    Sign in
                  </Link>
                  <Link 
                    to="/register" 
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300
                    ${scrolled 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu with clean styling */}
      <div 
        className={`sm:hidden bg-white shadow-lg transition-all duration-300 overflow-hidden ${
          navbarOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0'
        }`} 
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            to="/"
            className={`flex items-center ${activeLink === "home" ? "bg-blue-50 text-blue-800 font-bold" : "text-blue-700"} hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-all`}
            onClick={() => { setNavbarOpen(false); setActiveLink("home"); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          
          <Link 
            to="/learning-paths"
            className={`flex items-center ${activeLink === "learning-paths" ? "bg-blue-50 text-blue-800 font-bold" : "text-blue-700"} hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-all`}
            onClick={() => { setNavbarOpen(false); setActiveLink("learning-paths"); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Learning Paths
          </Link>
          
          <Link 
            to="/create-path"
            className={`flex items-center ${activeLink === "create-path" ? "bg-blue-50 text-blue-800 font-bold" : "text-white bg-blue-600 hover:bg-blue-700"} block px-3 py-2 rounded-md text-base font-medium transition-all`}
            onClick={() => { setNavbarOpen(false); setActiveLink("create-path"); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Create Learning Path
          </Link>
          
          <Link 
            to="/posts"
            className={`flex items-center ${activeLink === "posts" ? "bg-blue-50 text-blue-800 font-bold" : "text-blue-700"} hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-all`}
            onClick={() => { setNavbarOpen(false); setActiveLink("posts"); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Community Posts
          </Link>
          
          {currentUser ? (
            <>
              <div className="border-t border-gray-200 my-2"></div>
              <Link
                to="/profile"
                className="flex items-center text-blue-700 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-all"
                onClick={() => setNavbarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>
              <Link 
                to="/learning-progress"
                className="flex items-center text-blue-700 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-all"
                onClick={() => setNavbarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                My Learning Progress
              </Link>
              <Link 
                to="/saved-paths"
                className="flex items-center text-blue-700 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-all"
                onClick={() => setNavbarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Learning Paths
              </Link>
              <Link 
                to="/settings"
                className="flex items-center text-blue-700 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-all"
                onClick={() => setNavbarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <button 
                onClick={() => { handleLogout(); setNavbarOpen(false); }}
                className="flex items-center text-red-600 hover:bg-red-50 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-gray-200 my-2"></div>
              <Link 
                to="/login" 
                className="flex items-center text-blue-700 hover:bg-blue-50 px-3 py-2.5 rounded-md text-base font-medium transition-all"
                onClick={() => setNavbarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Link>
              <Link 
                to="/register" 
                className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-3 py-2.5 rounded-md text-base font-medium transition-all"
                onClick={() => setNavbarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Add CSS for the animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.8; }
           50% { transform: scale(1.3); opacity: 0.4; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        
        @keyframes floatUpAndFade {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-25px); opacity: 0; }
        }
        
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const { openMobileSidebar } = useUI();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = state.user;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-50 flex items-center justify-between px-6">
      {/* Logo and Mobile Menu */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - visible only on mobile */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md md:hidden"
          onClick={openMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
            <img src="/assets/logo.png" alt="Test Management Illustration" height={300} width={120}  />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={toggleDropdown}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            {/* Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                {user ? (
                  <span className="text-sm font-medium text-white">
                    {getInitial(user.name)}
                  </span>
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
            )}

            {/* Name and Role */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
            </div>

            {/* Dropdown Indicator */}
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              role="menu"
              aria-orientation="vertical"
              aria-label="User menu options"
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';

interface SidebarProps {
  questionSidebar?: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <img src="/assets/dashboard.png" alt="Dashboard" className="h-5 w-5 object-contain" />,
  },
  {
    label: 'Test Creation',
    path: '/tests/create',
    icon: <img src="/assets/create-test.png" alt="Create Test" className="h-5 w-5 object-contain" />,
  },
  {
    label: 'Test Tracking',
    path: '',
    icon: <img src="/assets/tracking.png" alt="Test Tracking" className="h-5 w-5 object-contain" />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ questionSidebar }) => {
  const location = useLocation();
  const { state, closeMobileSidebar } = useUI();
  const collapsed = state.sidebarCollapsed;
  const mobileSidebarOpen = state.mobileSidebarOpen;

  const isActive = (path: string, label: string): boolean => {
    
    if (label === 'Test Tracking') {
      return false;
    }
    if (label === 'Dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      {questionSidebar && (
        <div className="border-b border-gray-200 overflow-y-auto">
          {questionSidebar}
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 py-4" aria-label="Sidebar navigation">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path, item.label);
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={active ? 'text-blue-600' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      <aside
        className={`hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 transition-all duration-300 flex-col ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 h-full w-60 bg-white shadow-xl flex flex-col">            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <span className="text-lg font-bold text-blue-600">Preproute</span>
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;

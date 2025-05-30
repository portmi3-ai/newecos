import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Layers, Cloud, FileText, Settings, HelpCircle, Network, GitBranch, Grid, DollarSign } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Create Agent', icon: PlusCircle, path: '/create' },
    { name: 'Manage Agents', icon: Layers, path: '/manage' },
    { name: 'Funding Advisor', icon: DollarSign, path: '/advisor' },
    { name: 'Agent Ecosystem', icon: Network, path: '/ecosystem' },
    { name: 'Agent Relationships', icon: GitBranch, path: '/relationships' },
    { name: 'Vertical Blueprints', icon: Grid, path: '/blueprints' },
    { name: 'Deployments', icon: Cloud, path: '/deployments' },
    { name: 'Documentation', icon: FileText, path: '/documentation' },
  ];

  const secondaryNavigation = [
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Help', icon: HelpCircle, path: '/help' },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 transform bg-white border-r border-gray-200 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:w-64 md:flex-shrink-0`}
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="px-4 mt-14 md:mt-0">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Navigation
            </h2>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 pt-2 pb-5 border-t border-gray-200">
          <div className="px-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Support</h2>
          </div>
          <nav className="mt-3 px-2 space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
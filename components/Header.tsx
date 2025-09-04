
import React from 'react';

type View = 'calculator' | 'orders' | 'settings';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const navItems: { id: View; label: string }[] = [
    { id: 'calculator', label: 'Calculator' },
    { id: 'orders', label: 'Orders' },
    { id: 'settings', label: 'Settings' },
  ];

  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
  const activeClasses = 'bg-indigo-600 text-white shadow';
  const inactiveClasses = 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600';

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-indigo-600">Curtain Calculator</h1>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`${baseClasses} ${currentView === item.id ? activeClasses : inactiveClasses}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <nav className="md:hidden pt-2 pb-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex-1 text-sm ${baseClasses} ${currentView === item.id ? activeClasses : inactiveClasses}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

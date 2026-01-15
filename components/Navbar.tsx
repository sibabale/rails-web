
import React from 'react';

interface NavbarProps {
  onLogin?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogin }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-white rounded-sm group-hover:scale-110 transition-transform duration-300"></div>
            <span className="font-heading font-bold text-xl tracking-tight">Rails</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Login
          </button>
          <a
            href="#beta"
            className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Apply for Beta
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

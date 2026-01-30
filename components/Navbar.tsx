
import React from 'react';

interface NavbarProps {
  onLogin?: () => void;
  onRegister?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogin, onRegister }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-100 dark:border-zinc-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} className="flex items-center gap-2 group">
            <img
              src="/logo.svg"
              alt="Rails logo"
              className="w-6 h-6 rounded-sm group-hover:scale-110 transition-transform duration-300 dark:invert"
            />
            <span className="font-heading font-bold text-xl tracking-tight text-zinc-800 dark:text-white">Rails</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={onRegister}
            className="text-sm font-medium bg-zinc-800 text-white dark:bg-white dark:text-black px-5 py-2 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
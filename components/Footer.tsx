import React from 'react';

interface FooterProps {
  onToggleTheme?: () => void;
  currentTheme?: 'light' | 'dark';
}

const Footer: React.FC<FooterProps> = ({ onToggleTheme, currentTheme }) => {
  return (
    <footer className="py-12 border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={currentTheme === 'dark' ? '/logo-white.svg' : '/logo.svg'} alt="Rails" className="w-5 h-5 object-contain" />
            <span className="font-heading font-bold tracking-tight text-lg text-zinc-900 dark:text-white">Rails</span>
            <span className="text-zinc-400 dark:text-zinc-600 ml-4 text-sm font-mono">© 2024 RAILS INFRA INC.</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm">
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

            <button 
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-sharp !text-[18px] text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {currentTheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {currentTheme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
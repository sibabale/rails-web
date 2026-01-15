
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-zinc-900 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
            <span className="font-bold tracking-tighter">RAILS</span>
            <span className="text-zinc-600 ml-4 text-sm font-mono">© 2024 RAILS INFRA INC.</span>
          </div>
          
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#beta" className="text-zinc-300 hover:text-white transition-colors font-medium">Request Access</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

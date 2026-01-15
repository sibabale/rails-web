
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BetaSignup from './components/BetaSignup';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Stealth section divider */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        </div>

        <Features />
        
        <BetaSignup />
      </main>

      <Footer />
    </div>
  );
}

export default App;

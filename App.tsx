
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
        
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Infrastructure you can trust.</h2>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              {['Stripe', 'Vercel', 'Brex', 'Mercury', 'Ramp'].map(p => (
                <span key={p} className="text-xl font-bold tracking-widest">{p.toUpperCase()}</span>
              ))}
            </div>
            <p className="mt-8 text-zinc-500 text-sm">Join the next generation of financial powerhouses.</p>
          </div>
        </div>

        <BetaSignup />
      </main>

      <Footer />
    </div>
  );
}

export default App;

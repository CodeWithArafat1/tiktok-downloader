import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

function App() {
  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-cyan-500/30">
      <Navbar />
      <main>
        <Hero />
      </main>
      
      {/* Simple Footer */}
      <footer className="text-center py-8 text-gray-600 text-sm border-t border-white/5 mt-10">
        <p>© 2024 TikLoad. Made with ❤️ for Creators.</p>
      </footer>
    </div>
  );
}

export default App;
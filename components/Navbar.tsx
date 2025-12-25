
import React, { useState, useEffect } from 'react';
import { Menu, X, Activity } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About Us', id: 'about' },
    { name: 'Contact Us', id: 'contact' },
  ];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
      scrolled 
        ? 'py-4 border-b border-white/5 bg-gradient-to-b from-slate-950/90 to-slate-950/70 backdrop-blur-2xl' 
        : 'py-8 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => scrollTo('home')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-500">
              Insight<span className="text-indigo-500">AI</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-14">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`relative text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-300 group ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {link.name}
                  {/* Refined Active Indicator */}
                  <span className={`absolute -bottom-2.5 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 rounded-full ${
                    isActive ? 'w-full opacity-100 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-30'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-white p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-slate-950/98 backdrop-blur-3xl z-50 p-10 flex flex-col space-y-10 animate-in slide-in-from-top duration-500">
          <div className="flex flex-col space-y-8">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => scrollTo(link.id)} 
                className={`text-4xl font-black text-left uppercase tracking-tighter transition-all ${
                  activeSection === link.id ? 'text-white translate-x-4' : 'text-slate-600'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
          <div className="pt-10 border-t border-white/5">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">Enterprise Data Intelligence</p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

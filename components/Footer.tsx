
import React from 'react';
import { Activity, Twitter, Linkedin, Github, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'About Us', id: 'about' },
    { name: 'Contact Us', id: 'contact' },
  ];

  const socialLinks = [
    { icon: <Twitter />, label: 'Twitter' },
    { icon: <Linkedin />, label: 'LinkedIn' },
    { icon: <Github />, label: 'GitHub' },
    { icon: <MessageCircle />, label: 'Discord' },
  ];

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-24 pb-16 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-20">
          
          {/* Brand Identity */}
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => scrollTo('home')}
            >
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase">Insight<span className="text-indigo-500">AI</span></span>
            </div>
            <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed opacity-70">
              Automating the transition from fragmented datasets to enterprise-grade visual intelligence.
            </p>
          </div>

          {/* Centered Navigation */}
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.4em] relative group"
              >
                {item.name}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Social Presence */}
          <div className="flex justify-center md:justify-end gap-5">
            {socialLinks.map((social, idx) => (
              <a 
                key={idx}
                href="#"
                className="w-12 h-12 rounded-2xl glass border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:border-indigo-500/40 transition-all group"
                aria-label={social.label}
              >
                <span className="w-5 h-5 group-hover:scale-110 transition-transform">
                  {social.icon}
                </span>
              </a>
            ))}
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-12 border-t border-white/5 text-center">
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
            © 2025 InsightAI Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

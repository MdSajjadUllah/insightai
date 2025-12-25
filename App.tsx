
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [dashboardContext, setDashboardContext] = useState<{ schema: any, rawData: any[], datasetProfile: any } | null>(null);

  useEffect(() => {
    if (dashboardContext) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    const handleScroll = () => {
      if (dashboardContext) return;
      const sections = ['home', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dashboardContext]);

  if (dashboardContext) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#010409]">
        <Dashboard 
          schema={dashboardContext.schema} 
          rawData={dashboardContext.rawData} 
          datasetProfile={dashboardContext.datasetProfile}
          onBack={() => setDashboardContext(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeSection={activeSection} />
      <main className="flex-grow">
        <Hero onDashboardCreated={(schema, rawData, datasetProfile) => setDashboardContext({ schema, rawData, datasetProfile })} />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;

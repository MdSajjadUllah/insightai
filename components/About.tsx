
import React from 'react';
import { 
  CheckCircle2, LayoutDashboard, Wallet, History, Users, 
  Settings, ArrowUpRight, DollarSign, Eye 
} from 'lucide-react';

const About: React.FC = () => {
  const features = [
    "AI-powered data analysis",
    "Automatic dashboard generation",
    "Interactive & responsive visualizations",
    "No coding or technical skills required"
  ];

  return (
    <section id="about" className="py-24 md:py-40 px-5 bg-slate-950/40 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* DASHBOARD VISUAL MOCKUP - High-Fidelity Static Illustration */}
          <div className="w-full lg:col-span-8 order-1 lg:order-1 select-none pointer-events-none">
            <div className="relative group">
              {/* Refined Ambient Glows */}
              <div className="absolute -top-10 -left-10 w-[400px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full" />
              <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[140px] rounded-full" />
              
              {/* Premium Dashboard Frame */}
              <div className="glass rounded-[3rem] md:rounded-[4rem] border border-white/5 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row h-auto min-h-[500px] md:h-[680px] relative">
                
                {/* Static Sidebar */}
                <div className="hidden md:flex w-24 flex-col items-center py-12 border-r border-white/5 bg-slate-950/40 space-y-12">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col space-y-10 opacity-10">
                    <Wallet className="w-6 h-6" />
                    <History className="w-6 h-6" />
                    <Users className="w-6 h-6" />
                    <Settings className="w-6 h-6 mt-auto" />
                  </div>
                </div>

                {/* Dashboard Core Visuals */}
                <div className="flex-1 p-8 md:p-12 flex flex-col space-y-10 bg-gradient-to-br from-slate-900/20 to-transparent">
                  
                  {/* Decorative Header Bar */}
                  <div className="flex items-center justify-between opacity-80">
                    <div className="h-12 w-48 md:w-72 bg-slate-900/40 rounded-2xl border border-white/5 flex items-center px-5">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-800 mr-4" />
                      <div className="h-2 w-32 bg-slate-800 rounded-full" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                      </div>
                      <div className="hidden sm:flex items-center space-x-3 bg-slate-900/60 p-1.5 pr-5 rounded-2xl border border-white/5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg" />
                        <div className="h-2 w-20 bg-slate-800 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Main Data Illustration Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Visual Card 1: Balance */}
                    <div className="xl:col-span-5 flex flex-col space-y-8">
                      <div className="glass-card p-8 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/10 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-10">
                          <div>
                            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mb-3">Portfolio</p>
                            <h4 className="text-4xl font-black text-white">$124,082.00</h4>
                          </div>
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-slate-500 text-[11px] font-mono opacity-40">
                          <span>••••</span> <span>••••</span> <span>8088</span>
                        </div>
                      </div>

                      <div className="glass-card p-8 rounded-[3rem] bg-slate-900/20 border border-white/5 opacity-80">
                        <div className="h-2.5 w-24 bg-slate-800 rounded-full mb-8" />
                        <div className="flex -space-x-4 mb-8">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full ring-4 ring-slate-950 bg-slate-800 border border-white/10 overflow-hidden opacity-40">
                               <img src={`https://i.pravatar.cc/100?u=avatar${i}`} alt="user" className="w-full h-full object-cover grayscale" />
                            </div>
                          ))}
                        </div>
                        <div className="w-full h-12 bg-indigo-500/10 rounded-2xl border border-indigo-500/20" />
                      </div>
                    </div>

                    {/* Visual Card 2: Chart Illustration */}
                    <div className="xl:col-span-7 glass-card p-8 rounded-[3rem] flex flex-col bg-slate-900/30 border border-white/5">
                      <div className="flex justify-between items-center mb-12">
                        <div className="h-2.5 w-32 bg-slate-800 rounded-full" />
                        <div className="h-8 w-20 bg-slate-800/50 rounded-xl" />
                      </div>
                      <div className="flex-1 flex items-end justify-between px-3 gap-3 min-h-[180px]">
                        {[45, 75, 55, 95, 65, 85, 70, 50, 90].map((v, i) => (
                          <div key={i} className="flex-1 bg-slate-800/10 rounded-full h-full relative overflow-hidden group/bar">
                            <div className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-indigo-600 via-indigo-400 to-purple-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]" style={{ height: `${v}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Transaction History Visuals */}
                  <div className="hidden md:grid grid-cols-2 gap-8 opacity-60">
                    {[1, 2].map(i => (
                      <div key={i} className="p-5 bg-white/[0.03] rounded-[2rem] border border-white/5 flex items-center justify-between">
                         <div className="flex items-center space-x-5">
                           <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                             {i === 1 ? <DollarSign className="w-5 h-5 text-indigo-400" /> : <Eye className="w-5 h-5 text-purple-400" />}
                           </div>
                           <div className="space-y-3">
                             <div className="h-2.5 w-24 bg-slate-700 rounded-full" />
                             <div className="h-2 w-16 bg-slate-800 rounded-full" />
                           </div>
                         </div>
                         <div className="h-2.5 w-14 bg-emerald-500/20 rounded-full" />
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* TEXT CONTENT */}
          <div className="w-full lg:col-span-4 order-2 lg:order-2 space-y-12 lg:py-10">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.95] tracking-tighter uppercase">
                Visual <br />
                <span className="gradient-text italic">Precision.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed opacity-70">
                Transform raw data into a visual masterpiece. Our platform synthesizes complexity into clarity, empowering your team with professional, automated analytics.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center space-x-5 group">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-white text-sm md:text-base font-black tracking-[0.05em] uppercase tracking-widest opacity-80">{feature}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;


import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2, Mail, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({ email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
      setFormData({ email: '', message: '' });
      setTimeout(() => setFormState('idle'), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 md:py-40 px-5 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24 px-2">
          <h2 className="text-4xl md:text-7xl font-bold text-white mb-6 uppercase tracking-tighter">Get in Touch</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium text-base md:text-xl opacity-80">
            Have questions about enterprise scaling? Our professional architecture team is ready to assist.
          </p>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:grid md:grid-cols-5 gap-12 items-start">
          
          {/* Info Cards */}
          <div className="w-full md:col-span-2 space-y-6">
            <div className="glass p-8 rounded-[2rem] border border-white/5 flex items-start space-x-5 shadow-2xl">
              <div className="p-4 bg-violet-600/10 rounded-2xl border border-violet-500/20 text-violet-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base md:text-lg uppercase tracking-tight">Direct Email</h4>
                <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">Response within 24 hours guaranteed for all inquiries.</p>
              </div>
            </div>
            <div className="glass p-8 rounded-[2rem] border border-white/5 flex items-start space-x-5 shadow-2xl">
              <div className="p-4 bg-purple-600/10 rounded-2xl border border-purple-500/20 text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base md:text-lg uppercase tracking-tight">Live Support</h4>
                <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">Enterprise clients receive a dedicated success manager.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full md:col-span-3 glass p-10 md:p-14 rounded-[3rem] border border-white/5 shadow-[0_50px_100px_-30px_rgba(0,0,0,1)] relative overflow-hidden">
            {formState === 'success' ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-3 uppercase tracking-tighter">Transmission Sent</h3>
                  <p className="text-slate-500 font-bold text-sm">Our team will contact you at the provided address shortly.</p>
                </div>
                <button 
                  onClick={() => setFormState('idle')}
                  className="mt-4 px-12 py-4 bg-white/5 text-slate-400 font-bold rounded-full hover:bg-white/10 transition-all uppercase tracking-[0.3em] text-[10px]"
                >
                  New Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Email Address</label>
                  <input 
                    required
                    type="email"
                    placeholder="name@company.ai"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-5 bg-black border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-white font-bold text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="How can we help optimize your data?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-6 py-5 bg-black border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-white font-bold text-sm resize-none"
                  />
                </div>
                <button 
                  disabled={formState === 'submitting'}
                  type="submit"
                  className="w-full py-6 md:py-8 px-12 gradient-bg text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all flex items-center justify-center space-x-4 group active:scale-[0.98]"
                >
                  {formState === 'submitting' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                  <span>{formState === 'submitting' ? 'Transmitting...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;

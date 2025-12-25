
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, TrendingUp, Info, LayoutDashboard,
  Sparkles, Database, Zap, Download, 
  SlidersHorizontal, ChevronDown, Layers, AlertCircle, X, Filter,
  ArrowDownLeft, RotateCcw, Calculator
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface FilterSchema {
  id: string;
  column: string;
  label: string;
  filterType: string;
  options?: string[];
}

interface DashboardProps {
  schema: {
    dashboardTitle: string;
    dashboardSummary: string;
    filters: FilterSchema[];
    kpis: Array<{ 
      label: string; 
      column: string; 
      aggregation: string; 
      prefix?: string; 
      suffix?: string;
      business_reason?: string;
    }>;
    charts: Array<{ 
      visualType: string; 
      title: string; 
      xColumn: string; 
      yColumn: string; 
      aggregation: string; 
      insight: string;
      drillDownColumn: string;
      business_reason?: string;
    }>;
    keyInsights: string[];
  };
  rawData: any[];
  datasetProfile: any;
  onBack: () => void;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b'];

/**
 * Enhanced metadata tooltip showing column profiles and business logic.
 * Ensures text wraps and stays within bounds.
 */
const ProfileTooltip: React.FC<{ 
  profile: any; 
  visible: boolean; 
  x: number; 
  y: number;
  extraInfo?: string;
  title?: string;
}> = ({ profile, visible, x, y, extraInfo, title }) => {
  if (!visible || (!profile && !extraInfo)) return null;
  
  const tooltipWidth = 280;
  const adjustedX = x + tooltipWidth > window.innerWidth ? x - tooltipWidth - 20 : x + 20;

  return (
    <div 
      className="fixed z-[9999] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
      style={{ left: Math.max(10, adjustedX), top: y, width: tooltipWidth }}
    >
      <div className="flex items-center space-x-2 mb-3">
        <Database className="w-3 h-3 text-indigo-400" />
        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{title || 'Metadata'}</p>
      </div>
      
      {profile && (
        <div className="space-y-2 mb-3 border-b border-white/5 pb-3">
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 text-[8px] uppercase font-black">Field</span>
            <span className="text-white text-[9px] font-bold truncate">{profile.originalName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 text-[8px] uppercase font-black">Type</span>
            <span className="text-indigo-300 text-[9px] font-bold">{profile.type}</span>
          </div>
        </div>
      )}

      {extraInfo && (
        <div className="space-y-1.5">
          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Insight</p>
          <p className="text-[9px] text-slate-300 leading-relaxed font-medium italic break-words line-clamp-4">
            "{extraInfo}"
          </p>
        </div>
      )}
    </div>
  );
};

const ChartRenderer: React.FC<{ 
  chartSchema: any; 
  data: any[]; 
  datasetProfile: any;
  onSetTooltip: (profile: any, x: number, y: number, extra?: string, title?: string) => void;
  onClearTooltip: () => void;
}> = ({ chartSchema, data, datasetProfile, onSetTooltip, onClearTooltip }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [drillDownValue, setDrillDownValue] = useState<string | null>(null);
  const [currentAgg, setCurrentAgg] = useState(chartSchema.aggregation || 'sum');

  useEffect(() => {
    if (!chartSchema || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect) {
        setDimensions({ 
          width: entries[0].contentRect.width, 
          height: entries[0].contentRect.height 
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [chartSchema]);

  const currentXCol = drillDownValue ? chartSchema.drillDownColumn : chartSchema.xColumn;
  const currentTitle = drillDownValue ? `${chartSchema.title} (${drillDownValue})` : chartSchema.title;

  const chartData = useMemo(() => {
    if (!chartSchema || !data || !Array.isArray(data) || !data.length || !currentXCol || !chartSchema.yColumn) {
      return [];
    }
    try {
      let workingData = data;
      if (drillDownValue) {
        workingData = data.filter(r => String(r[chartSchema.xColumn]) === drillDownValue);
      }

      const xCol = currentXCol;
      const yCol = chartSchema.yColumn;
      const groups: Record<string, number[]> = {};

      workingData.forEach(row => {
        if (!row || row[xCol] === undefined) return;
        const key = String(row[xCol] ?? 'Other');
        if (!groups[key]) groups[key] = [];
        groups[key].push(Number(row[yCol]) || 0);
      });

      return Object.entries(groups).map(([name, vals]) => {
        let value = 0;
        if (currentAgg === 'avg') value = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        else if (currentAgg === 'count') value = vals.length;
        else value = vals.reduce((a, b) => a + b, 0);
        return { name, value };
      }).sort((a, b) => b.value - a.value).slice(0, 10);
    } catch (e) {
      return [];
    }
  }, [data, chartSchema, drillDownValue, currentXCol, currentAgg]);

  const handleBarClick = (clickData: any) => {
    if (clickData && clickData.name && !drillDownValue && chartSchema.drillDownColumn && chartSchema.drillDownColumn !== chartSchema.xColumn) {
      setDrillDownValue(clickData.name);
    }
  };

  const visualType = String(chartSchema?.visualType || 'bar').toLowerCase();

  return (
    <div className="glass-card p-4 rounded-[2rem] border border-white/5 flex flex-col h-full min-h-[300px] shadow-xl relative group transition-all duration-500 hover:border-indigo-500/20 overflow-hidden">
      {/* Chart Header - Aggregation control moved INSIDE the card/box */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col space-y-1 min-w-0">
          <h4 className="text-[9px] font-black tracking-widest text-white/50 uppercase truncate flex items-center gap-1.5">
            <span className="truncate">{currentTitle}</span>
            {drillDownValue && <RotateCcw className="w-2.5 h-2.5 text-indigo-400 cursor-pointer" onClick={() => setDrillDownValue(null)} />}
          </h4>
          <div className="flex items-center space-x-2 text-[7px] text-slate-600 font-bold uppercase truncate">
             <span className="cursor-help hover:text-indigo-400" onMouseEnter={(e) => onSetTooltip(datasetProfile[currentXCol], e.clientX, e.clientY, chartSchema.insight, 'X-Axis')}>D: {currentXCol}</span>
             <span className="w-0.5 h-0.5 bg-slate-800 rounded-full" />
             <span className="cursor-help hover:text-indigo-400" onMouseEnter={(e) => onSetTooltip(datasetProfile[chartSchema.yColumn], e.clientX, e.clientY, chartSchema.business_reason, 'Metric')}>M: {chartSchema.yColumn}</span>
          </div>
        </div>
        
        {/* Aggregation Control - Integrated inside the chart box */}
        <div className="flex bg-slate-950/60 rounded-lg p-0.5 border border-white/5 shrink-0">
           {['sum', 'avg', 'count'].map((agg) => (
             <button
               key={agg}
               onClick={() => setCurrentAgg(agg)}
               className={`px-1.5 py-0.5 rounded-md text-[6px] font-black uppercase transition-all ${currentAgg === agg ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-400'}`}
             >
               {agg}
             </button>
           ))}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 w-full min-h-[140px] relative overflow-hidden">
        {chartData.length > 0 && dimensions.width > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {visualType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#475569" fontSize={7} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={7} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '9px' }} />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 2, fill: '#6366f1', strokeWidth: 0 }} />
              </LineChart>
            ) : visualType === 'pie' ? (
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} onClick={handleBarClick} className="outline-none">
                  {chartData.map((_, i) => <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} className="cursor-pointer outline-none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '9px' }} />
              </PieChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#475569" fontSize={7} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={7} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '9px' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} onClick={handleBarClick} className="cursor-pointer hover:fill-indigo-400 transition-all outline-none" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-800 text-[8px] font-black uppercase tracking-widest">Processing Node...</div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-start space-x-2 shrink-0">
         <Sparkles className="w-2.5 h-2.5 text-indigo-400 mt-0.5" />
         <p className="text-[8px] text-slate-500 italic leading-snug line-clamp-2 truncate break-words">
           {chartSchema?.insight || 'AI signal analysis active...'}
         </p>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ schema, rawData, datasetProfile, onBack }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [hoverProfile, setHoverProfile] = useState<{ profile: any; x: number; y: number; extra?: string; title?: string } | null>(null);

  const onSetTooltip = (profile: any, x: number, y: number, extra?: string, title?: string) => 
    setHoverProfile({ profile, x, y, extra, title });
  const onClearTooltip = () => setHoverProfile(null);

  const safeSchema = useMemo(() => schema || { dashboardTitle: 'Analytics', dashboardSummary: '', filters: [], kpis: [], charts: [], keyInsights: [] }, [schema]);

  const filteredData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];
    return rawData.filter(row => {
      if (!row) return false;
      return Object.entries(activeFilters).every(([col, val]) => !val || String(row[col] ?? '') === val);
    });
  }, [rawData, activeFilters]);

  const activeFilterCount = useMemo(() => Object.values(activeFilters).filter(v => v !== '').length, [activeFilters]);

  const computedKpis = useMemo(() => {
    return safeSchema.kpis.map(kpi => {
      try {
        let val = 0;
        const colVals = filteredData.map(r => Number(r[kpi.column])).filter(n => !isNaN(n));
        if (kpi.aggregation === 'avg') val = colVals.length > 0 ? colVals.reduce((a, b) => a + b, 0) / colVals.length : 0;
        else if (kpi.aggregation === 'count') val = filteredData.length;
        else val = colVals.reduce((a, b) => a + b, 0);
        
        const fmt = (v: number) => {
          if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
          if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
          return Math.round(v).toLocaleString();
        };
        return { ...kpi, display: `${kpi.prefix || ''}${fmt(val)}${kpi.suffix || ''}` };
      } catch (e) { return { ...kpi, display: '—' }; }
    });
  }, [filteredData, safeSchema.kpis]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#010409] font-inter select-none relative animate-in fade-in duration-700">
      <ProfileTooltip 
        visible={!!hoverProfile} 
        profile={hoverProfile?.profile} 
        x={hoverProfile?.x || 0} 
        y={hoverProfile?.y || 0} 
        extraInfo={hoverProfile?.extra}
        title={hoverProfile?.title}
      />

      <header className="flex-none h-16 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-slate-950/80 backdrop-blur-3xl z-[60]">
        <div className="flex items-center space-x-4 md:space-x-8">
          <button onClick={onBack} className="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 transition-all hover:text-white group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="text-[10px] md:text-xs font-black text-white uppercase tracking-tighter truncate max-w-[150px] md:max-w-md">{safeSchema.dashboardTitle}</h1>
            <span className="text-[6px] md:text-[7px] font-black text-slate-600 uppercase tracking-widest truncate">DRILL-SYNC V11 PRO</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${activeFilterCount > 0 ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && <span className="px-1.5 bg-white text-indigo-600 rounded-md text-[7px]">{activeFilterCount}</span>}
          </button>
          <button onClick={async () => {
             const element = document.getElementById('cockpit-main');
             if (!element) return;
             const canvas = await html2canvas(element, { scale: 1.5, backgroundColor: '#010409' });
             const pdf = new jsPDF('l', 'mm', 'a4');
             pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
             pdf.save(`${safeSchema.dashboardTitle}.pdf`);
          }} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* FILTER PANEL - Now wraps on desktop, stacks on mobile */}
      <div className={`absolute top-16 left-0 right-0 z-50 transition-all duration-500 transform ${isFilterOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-b-3xl p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
               <h3 className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2"><Filter className="w-3 h-3 text-indigo-400" /> Control Hub</h3>
               <button onClick={() => setActiveFilters({})} className="text-[8px] font-black text-indigo-500 uppercase hover:text-indigo-400">Clear Logic</button>
            </div>
            
            {/* WRAPPING GRID FOR FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[40vh] md:max-h-none custom-scroll pr-1">
              {safeSchema.filters.map(filter => (
                <div key={filter.id} className="space-y-2">
                  <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest truncate">{filter.label}</p>
                  <div className="relative">
                    <select 
                      className="w-full bg-slate-950/80 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      onChange={(e) => setActiveFilters(p => ({ ...p, [filter.column]: e.target.value }))}
                      value={activeFilters[filter.column] || ''}
                    >
                      <option value="">(All Segments)</option>
                      {filter.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-700 pointer-events-none" />
                  </div>
                </div>
              ))}
              {safeSchema.filters.length === 0 && <p className="text-[9px] text-slate-700 py-2">No active segments found.</p>}
            </div>
          </div>
        </div>
      </div>

      <main id="cockpit-main" className="flex-1 overflow-hidden p-3 md:p-5 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-5">
        {/* LEFT COLUMN: KPI DASHBOARD (ONE-SCREEN HEIGHT) */}
        <div className="md:col-span-3 flex flex-col space-y-3 h-full overflow-hidden">
           <div className="glass-card p-5 md:p-6 rounded-[2rem] border border-indigo-500/10 bg-indigo-500/[0.03] shrink-0">
              <div className="flex items-center space-x-2 mb-3"><Info className="w-3.5 h-3.5 text-indigo-400" /><h3 className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Summary</h3></div>
              <p className="text-[9px] text-slate-400 leading-relaxed font-medium line-clamp-3 overflow-hidden">{safeSchema.dashboardSummary}</p>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
              {computedKpis.map((kpi, i) => (
                <div key={i} className="glass-card p-4 rounded-[1.8rem] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-500 shrink-0"
                     onMouseEnter={(e) => onSetTooltip(datasetProfile[kpi.column], e.clientX, e.clientY, kpi.business_reason, 'Metric Logic')}
                     onMouseLeave={onClearTooltip}>
                   <div className="min-w-0 flex-1">
                      <p className="text-slate-500 text-[7px] font-black uppercase tracking-widest truncate">{kpi.label}</p>
                      <h3 className="text-lg font-black text-white tracking-tighter truncate">{kpi.display}</h3>
                   </div>
                   <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all ml-3 shrink-0"><TrendingUp className="w-4 h-4" /></div>
                </div>
              ))}
           </div>
        </div>

        {/* CENTER COLUMN: ANALYTICS CORE (ONE-SCREEN HEIGHT) */}
        <div className="md:col-span-6 flex flex-col space-y-3 h-full overflow-hidden">
           <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 overflow-y-auto pr-1 custom-scroll">
              {safeSchema.charts.map((chart, i) => (
                <ChartRenderer key={i} chartSchema={chart} data={filteredData} datasetProfile={datasetProfile} onSetTooltip={onSetTooltip} onClearTooltip={onClearTooltip} />
              ))}
           </div>
           <div className="flex-none h-12 border-t border-white/5 flex items-center justify-between px-6 bg-slate-950/20 rounded-2xl backdrop-blur-xl shrink-0">
              <div className="flex items-center space-x-6 text-slate-500 text-[8px] font-black uppercase tracking-widest overflow-hidden">
                 <div className="flex items-center space-x-2 truncate"><Database className="w-3.5 h-3.5 text-indigo-500" /><span>{filteredData.length.toLocaleString()} RECORDS</span></div>
                 <div className="flex items-center space-x-2 truncate"><Calculator className="w-3.5 h-3.5 text-purple-500" /><span>COMPUTED LIVE</span></div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: AI SIGNALS (ONE-SCREEN HEIGHT) */}
        <div className="md:col-span-3 flex flex-col space-y-3 h-full overflow-hidden">
           <div className="flex-1 glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden relative shadow-2xl">
              <div className="flex items-center space-x-3 mb-6"><LayoutDashboard className="w-4 h-4 text-indigo-400" /><h3 className="text-[9px] font-black text-white uppercase tracking-widest">Signal Hub</h3></div>
              <div className="flex-1 overflow-y-auto space-y-6 md:space-y-8 pr-1 custom-scroll">
                 {safeSchema.keyInsights.map((insight, i) => (
                   <div key={i} className="flex space-x-4 group overflow-hidden">
                      <div className="flex-none w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[8px] font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i+1}</div>
                      <p className="text-[9px] text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 break-words">{insight}</p>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent flex flex-col items-center text-center space-y-4 shrink-0">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30"><Zap className="w-6 h-6 text-indigo-400 animate-pulse" /></div>
              <button onClick={onBack} className="w-full py-4 rounded-2xl bg-white text-slate-950 text-[9px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all">New Analysis</button>
           </div>
        </div>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        #cockpit-main { max-height: calc(100vh - 4rem); }
      `}</style>
    </div>
  );
};

export default Dashboard;

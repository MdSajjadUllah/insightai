
import React, { useState, useEffect } from 'react';
import { Upload, Activity, FileJson, ChevronRight, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from '@google/genai';

interface HeroProps {
  onDashboardCreated: (schema: any, rawData: any[], datasetProfile: any) => void;
}

const Hero: React.FC<HeroProps> = ({ onDashboardCreated }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Analyzing dataset structure...",
    "Extracting business dimensions...",
    "Defining KPI correlations...",
    "Synthesizing visual logic...",
    "Generating AI insights...",
    "Finalizing dashboard schema..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % steps.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const profileDataset = (data: any[]) => {
    if (!data || data.length === 0) return {};
    const columns = Object.keys(data[0]);
    const profile: any = {};

    columns.forEach(col => {
      const values = data.map(r => r[col]).filter(v => v !== null && v !== undefined);
      const uniqueValues = new Set(values);
      const firstVal = values[0];
      
      let type = 'String';
      if (typeof firstVal === 'number') type = 'Numeric';
      else if (!isNaN(Date.parse(firstVal)) && String(firstVal).length > 5) type = 'Date';
      else if (typeof firstVal === 'boolean') type = 'Boolean';

      profile[col] = {
        type,
        uniqueCount: uniqueValues.size,
        originalName: col
      };
    });
    return profile;
  };

  const createDashboard = async () => {
    if (!uploadedFile) return;
    setIsGenerating(true);
    try {
      const { fullData, sampleJson } = await parseFile(uploadedFile);
      const datasetProfile = profileDataset(fullData);
      const dashboardSchema = await generateDashboardSchemaWithAI(sampleJson, uploadedFile.name);
      
      if (!dashboardSchema || typeof dashboardSchema !== 'object') {
        throw new Error("AI engine returned a malformed response.");
      }

      const cleanSchema = {
        dashboardTitle: String(dashboardSchema.dashboardTitle || "Intelligence Report"),
        dashboardSummary: String(dashboardSchema.dashboardSummary || "Dataset analysis successful."),
        filters: (dashboardSchema.filters || [])
          .filter((f: any) => f && f.column && f.id)
          .map((f: any) => ({
            id: String(f.id),
            column: String(f.column),
            label: String(f.label),
            filterType: String(f.filterType || 'category'),
            options: Array.isArray(f.options) ? f.options.filter((o: any) => o != null).map(String) : []
          })),
        kpis: (dashboardSchema.kpis || [])
          .filter((k: any) => k && k.column && k.label)
          .map((k: any) => ({
            label: String(k.label),
            column: String(k.column),
            aggregation: String(k.aggregation || 'sum'),
            prefix: String(k.prefix || ''),
            suffix: String(k.suffix || ''),
            business_reason: String(k.business_reason || '')
          })),
        charts: (dashboardSchema.charts || [])
          .filter((c: any) => c && c.xColumn && c.yColumn && c.visualType)
          .map((c: any) => ({
            visualType: String(c.visualType).toLowerCase(),
            title: String(c.title || 'Data Insight'),
            xColumn: String(c.xColumn),
            yColumn: String(c.yColumn),
            aggregation: String(c.aggregation || 'sum'),
            insight: String(c.insight || ''),
            drillDownColumn: String(c.drillDownColumn || ''),
            business_reason: String(c.business_reason || '')
          })),
        keyInsights: (dashboardSchema.keyInsights || [])
          .filter((i: any) => i != null && typeof i === 'string')
          .map(String)
      };

      onDashboardCreated(cleanSchema, fullData, datasetProfile);
    } catch (error: any) {
      console.error("Dashboard Synthesis Error:", error);
      alert(`Synthesis Failure: ${error.message || "The AI engine encountered a structural error."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const parseFile = (file: File): Promise<{ fullData: any[], sampleJson: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);
            if (!json.length) throw new Error("Dataset is empty.");
            resolve({ fullData: json, sampleJson: JSON.stringify(json.slice(0, 20)) });
          } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text) { reject(new Error("File content is empty.")); return; }
          if (file.name.endsWith('.csv')) {
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
            if (!parsed.data.length) reject(new Error("CSV is empty."));
            resolve({ fullData: parsed.data, sampleJson: JSON.stringify(parsed.data.slice(0, 20)) });
          } else {
            try {
              const json = JSON.parse(text);
              const data = Array.isArray(json) ? json : [json];
              resolve({ fullData: data, sampleJson: JSON.stringify(data.slice(0, 20)) });
            } catch (err) { reject(new Error("Invalid JSON format.")); }
          }
        };
        reader.readAsText(file);
      }
    });
  };

  const generateDashboardSchemaWithAI = async (dataSample: string, filename: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `FILE: ${filename}\nDATA_SAMPLE: ${dataSample}`,
      config: {
        systemInstruction: "You are a lead Business Intelligence Architect. Design a production-grade Dashboard Schema. Use 'visualType' (bar, line, pie) and 'filterType' (category, range). Use standard aggregations: sum, avg, count. For each chart, identify a 'drillDownColumn' which is a logical sub-dimension or more granular field than xColumn. For each KPI and Chart, provide a 'business_reason' explaining why this metric matters for strategic decision making.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dashboardTitle: { type: Type.STRING },
            dashboardSummary: { type: Type.STRING },
            filters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  column: { type: Type.STRING },
                  label: { type: Type.STRING },
                  filterType: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "column", "label", "filterType"]
              }
            },
            kpis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  column: { type: Type.STRING },
                  aggregation: { type: Type.STRING },
                  prefix: { type: Type.STRING },
                  suffix: { type: Type.STRING },
                  business_reason: { type: Type.STRING }
                },
                required: ["label", "column", "aggregation", "business_reason"]
              }
            },
            charts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  visualType: { type: Type.STRING },
                  title: { type: Type.STRING },
                  xColumn: { type: Type.STRING },
                  yColumn: { type: Type.STRING },
                  aggregation: { type: Type.STRING },
                  insight: { type: Type.STRING },
                  drillDownColumn: { type: Type.STRING },
                  business_reason: { type: Type.STRING }
                },
                required: ["visualType", "title", "xColumn", "yColumn", "aggregation", "drillDownColumn", "business_reason"]
              }
            },
            keyInsights: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["dashboardTitle", "dashboardSummary", "filters", "kpis", "charts", "keyInsights"]
        }
      }
    });

    const output = response.text;
    if (!output) throw new Error("Empty response from AI engine.");
    return JSON.parse(output.trim());
  };

  return (
    <section id="home" className="relative pt-32 pb-24 md:pt-48 md:pb-36 px-5 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full glass border border-white/10 text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase mb-12 animate-fade-in shadow-2xl">
          <BrainCircuit className="w-4 h-4" />
          <span>Real-Time BI Engine v10.5</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-[5.5rem] font-black tracking-tighter text-white mb-8 md:mb-12 max-w-5xl leading-[0.9] uppercase">
          Upload Data. <br />
          <span className="gradient-text italic">Live Intelligence.</span>
        </h1>

        <p className="text-slate-400 text-base md:text-xl max-w-2xl mb-16 md:mb-24 font-medium leading-relaxed opacity-70">
          Precision analytics, dynamic aggregation, and interactive drill-downs. Powered by Gemini 3.
        </p>

        <div className="w-full max-w-4xl relative">
          <div className="glass p-6 md:p-14 rounded-[3rem] md:rounded-[4.5rem] border border-white/10 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)] group overflow-hidden">
            <div className="scan-line" />
            
            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[2rem] md:rounded-[3.5rem] p-12 md:p-24 hover:border-indigo-500/50 transition-all duration-700 bg-slate-950/40 cursor-pointer">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                onChange={handleFileChange}
                disabled={isGenerating}
                accept=".csv,.xlsx,.xls,.json"
              />
              
              {!uploadedFile ? (
                <div className="flex flex-col items-center space-y-8">
                  <div className="p-8 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                    <Upload className="w-12 h-12 md:w-20 md:h-20 text-indigo-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-white text-3xl md:text-5xl font-black tracking-tight uppercase">Ingest Dataset</h3>
                    <p className="text-slate-500 text-[11px] md:text-sm font-black uppercase tracking-[0.4em]">CSV, XLSX, JSON</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in-95 duration-500 space-y-8">
                  <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 shadow-xl">
                    <FileJson className="w-12 h-12 md:w-20 md:h-20 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white text-2xl md:text-4xl font-black truncate max-w-[280px] md:max-w-none">{uploadedFile.name}</h3>
                    <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.4em]">Ready for Analysis</p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={createDashboard}
              disabled={!uploadedFile || isGenerating}
              className={`w-full mt-10 md:mt-14 py-7 md:py-9 px-12 gradient-bg text-white font-black text-xl md:text-2xl rounded-[2rem] md:rounded-[2.5rem] transition-all transform active:scale-[0.98] flex flex-col items-center justify-center space-y-2 uppercase tracking-[0.3em] ${(!uploadedFile || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <>
                  <div className="flex items-center space-x-5">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin" />
                    <span>Synthesizing...</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-200 opacity-60 animate-pulse mt-4">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{steps[loadingStep]}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-5">
                  <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
                  <span>Build Live BI</span>
                  <ChevronRight className="w-8 h-8 opacity-30 group-hover:translate-x-3 transition-transform" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

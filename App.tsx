
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  Calculator, ShieldCheck, Wallet, Sparkles, AlertCircle, 
  Coins, Briefcase, Percent, Save, LayoutDashboard, Plus, Info, ChevronRight, History, ArrowDownToLine, TrendingDown, CheckCircle2,
  // Added TrendingUp to resolve missing import error
  TrendingUp
} from 'lucide-react';
import { TaxData, CalculationResult, SavedScenario, HistoricalTurnover } from './types';
import { ATECO_ACTIVITIES, INPS_RATES } from './constants';
import { getTaxAdvice } from './services/geminiService';
import InfoCard from './components/InfoCard';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'dashboard'>('calculator');
  
  const [taxData, setTaxData] = useState<TaxData>({
    fatturato2026: 35000,
    coefficiente: 78,
    aliquota: 5,
    inpsRate: INPS_RATES.GESTIONE_SEPARATA,
    deduzioni: 0,
    historical: [
      { year: 2023, value: 25000 },
      { year: 2024, value: 28000 },
      { year: 2025, value: 30000 }
    ]
  });

  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  useEffect(() => {
    const scenarios = localStorage.getItem('fpro_scenarios_v6');
    if (scenarios) setSavedScenarios(JSON.parse(scenarios));
  }, []);

  const handleSaveScenario = () => {
    const name = scenarioName || `Test 2026 - ${new Date().toLocaleDateString()}`;
    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name,
      date: new Date().toISOString(),
      taxData,
      results
    };
    const updated = [newScenario, ...savedScenarios];
    setSavedScenarios(updated);
    localStorage.setItem('fpro_scenarios_v6', JSON.stringify(updated));
    setScenarioName('');
    alert('Scenario salvato!');
  };

  const calculatePureTaxes = (value: number, coeff: number, rate: number, inps: number) => {
    const imponibile = (value * coeff) / 100;
    const contributi = imponibile * (inps / 100);
    const base = Math.max(0, imponibile - contributi);
    const imposta = base * (rate / 100);
    return { contributi, imposta, totale: contributi + imposta, imponibile };
  };

  const results = useMemo((): CalculationResult => {
    const val2023 = taxData.historical.find(h => h.year === 2023)?.value || 0;
    const val2024 = taxData.historical.find(h => h.year === 2024)?.value || 0;
    const val2025 = taxData.historical.find(h => h.year === 2025)?.value || 0;

    const tax2024 = calculatePureTaxes(val2024, taxData.coefficiente, taxData.aliquota, taxData.inpsRate);
    const tax2025 = calculatePureTaxes(val2025, taxData.coefficiente, taxData.aliquota, taxData.inpsRate);

    // Saldo 2025 da pagare nel 2026
    // Gli acconti pagati nel 2025 erano basati sul 2024
    const accontiVersatiNel2025Inps = tax2024.contributi * 0.8;
    const accontiVersatiNel2025Imposta = tax2024.imposta;
    
    const saldoInps2025 = Math.max(0, tax2025.contributi - accontiVersatiNel2025Inps);
    const creditoInps2025 = Math.max(0, accontiVersatiNel2025Inps - tax2025.contributi);
    
    const saldoImposta2025 = Math.max(0, tax2025.imposta - accontiVersatiNel2025Imposta);
    const creditoImposta2025 = Math.max(0, accontiVersatiNel2025Imposta - tax2025.imposta);

    const saldoDovuto2025 = saldoInps2025 + saldoImposta2025;
    const creditoMaturato2025 = creditoInps2025 + creditoImposta2025;

    // Acconti 2026 (basati sul reale 2025)
    const accontoInps2026 = tax2025.contributi * 0.8;
    const accontoImposta2026 = tax2025.imposta;

    // Esborso finanziario nel 2026
    const totaleEsborso2026 = Math.max(0, saldoDovuto2025 - creditoMaturato2025) + accontoInps2026 + accontoImposta2026;

    // Previsione 2026
    const imponibileLordo2026 = (taxData.fatturato2026 * taxData.coefficiente) / 100;
    // I contributi versati nel 2026 sono saldo 2025 + acconti 2026
    const contributiDeducibili2026 = Math.max(0, saldoInps2025 - creditoInps2025) + accontoInps2026;
    const imponibileNetto2026 = Math.max(0, imponibileLordo2026 - contributiDeducibili2026);
    
    const impostaSostitutiva2026 = imponibileNetto2026 * (taxData.aliquota / 100);
    const contributiInps2026_saldo = imponibileLordo2026 * (taxData.inpsRate / 100);

    const tasseTotaliStimate2026 = contributiInps2026_saldo + impostaSostitutiva2026;
    const redditoNettoAnnuale2026 = taxData.fatturato2026 - tasseTotaliStimate2026;

    // Fix: Properly populated the CalculationResult object with all required properties
    return {
      imponibile2025: tax2025.imponibile,
      tasseTotali2025: tax2025.totale,
      saldoDovuto2025,
      creditoMaturato2025,
      redditoLordo2026: taxData.fatturato2026,
      imponibileLordo2026,
      contributiDeducibili2026,
      imponibileNetto2026,
      accontoInps2026,
      accontoImposta2026,
      totaleEsborso2026,
      redditoNettoAnnuale2026,
      redditoNettoMensile2026: redditoNettoAnnuale2026 / 12,
      percentualeCaricoFiscale: taxData.fatturato2026 > 0 ? (tasseTotaliStimate2026 / taxData.fatturato2026) * 100 : 0,
      accantonamentoMensileTasse: totaleEsborso2026 / 12,
      contributiInpsSaldo: accontoInps2026,
      impostaSostitutivaSaldo: impostaSostitutiva2026,
      redditoNettoMensile: redditoNettoAnnuale2026 / 12,
      tasseTotaliSaldo: tasseTotaliStimate2026
    };
  }, [taxData]);

  const historicalDataForChart = useMemo(() => {
    const data = taxData.historical.map(h => {
      const res = calculatePureTaxes(h.value, taxData.coefficiente, taxData.aliquota, taxData.inpsRate);
      return {
        anno: h.year.toString(),
        fatturato: h.value,
        tasse: res.totale,
      };
    });
    return [...data, { 
      anno: '2026 (Stima)', 
      fatturato: results.redditoLordo2026, 
      tasse: results.totaleEsborso2026, 
    }];
  }, [taxData, results]);

  const handleAiAdvice = async () => {
    setIsLoadingAdvice(true);
    // Fix: Removed 'as any' and used properly typed parameters
    const advice = await getTaxAdvice(
      { ...taxData, fatturato: taxData.fatturato2026 }, 
      results
    );
    setAiAdvice(advice);
    setIsLoadingAdvice(false);
  };

  const formatEuro = (val: number) => 
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);

  const updateHistorical = (year: number, val: number) => {
    const newHist = taxData.historical.map(h => h.year === year ? { ...h, value: val } : h);
    setTaxData({ ...taxData, historical: newHist });
  };

  return (
    <div className="min-h-screen pb-12 bg-[#f8fafc]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-md">
              <Calculator className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-950 tracking-tight uppercase">
              Forfettario<span className="text-indigo-600">Pro</span> AI <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 ml-2 font-bold">MODE: 2026</span>
            </h1>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setActiveTab('calculator')} className={`px-4 py-2 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'calculator' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>
              <Calculator className="w-4 h-4" /> <span>Simulatore</span>
            </button>
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>
              <LayoutDashboard className="w-4 h-4" /> <span>Archivio</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' ? (
          <Dashboard scenarios={savedScenarios} onDelete={(id) => {
            const updated = savedScenarios.filter(s => s.id !== id);
            setSavedScenarios(updated);
            localStorage.setItem('fpro_scenarios_v6', JSON.stringify(updated));
          }} onLoad={(s) => { setTaxData(s.taxData); setActiveTab('calculator'); }} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
            {/* INPUT SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* CARD PREVISIONE 2026 */}
              <section className="bg-white p-8 rounded-[2rem] border-2 border-slate-200 shadow-xl ring-4 ring-indigo-50">
                <h2 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-3 uppercase tracking-tight">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  Previsione 2026
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-2 uppercase tracking-widest">Fatturato 2026 Stimato (€)</label>
                    <div className="relative">
                      <input type="number" value={taxData.fatturato2026} onChange={(e) => setTaxData({ ...taxData, fatturato2026: Number(e.target.value) })} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none font-black text-slate-950 text-2xl" />
                      <Coins className="absolute left-4 top-4.5 w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-2 uppercase tracking-widest">Attività / Codice ATECO</label>
                    <div className="relative">
                      <select value={taxData.coefficiente} onChange={(e) => setTaxData({ ...taxData, coefficiente: Number(e.target.value) })} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 font-black text-slate-950 appearance-none">
                        {ATECO_ACTIVITIES.map(a => <option key={a.code} value={a.coefficient}>{a.name} ({a.coefficient}%)</option>)}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rotate-90 text-indigo-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setTaxData({ ...taxData, aliquota: 5 })} className={`py-4 rounded-2xl border-2 text-sm font-black transition-all ${taxData.aliquota === 5 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-300 text-slate-800'}`}>5% Start</button>
                    <button onClick={() => setTaxData({ ...taxData, aliquota: 15 })} className={`py-4 rounded-2xl border-2 text-sm font-black transition-all ${taxData.aliquota === 15 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-300 text-slate-800'}`}>15% Standard</button>
                  </div>
                </div>
              </section>

              {/* CARD STORICO (TEST VERIFICA) */}
              <section className="bg-white p-8 rounded-[2rem] border-2 border-slate-200 shadow-lg">
                <h2 className="text-lg font-black text-slate-950 mb-6 flex items-center gap-3 uppercase tracking-tight">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Storico Verificato (2023-25)
                </h2>
                <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase leading-tight">Inserisci i fatturati reali per testare l'accuratezza dei calcoli fiscali.</p>
                <div className="space-y-4">
                  {taxData.historical.map(h => (
                    <div key={h.year} className="group">
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Fatturato Lordo Realizzato {h.year} (€)</label>
                      <input 
                        type="number" 
                        value={h.value} 
                        onChange={(e) => updateHistorical(h.year, Number(e.target.value))} 
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-indigo-400 focus:bg-white transition-all"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* ACTION BUTTONS */}
              <div className="space-y-3">
                 <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200">
                    <input type="text" placeholder="Nome scenario..." value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm outline-none font-black text-slate-950 mb-3" />
                    <button onClick={handleSaveScenario} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"><Save className="w-5 h-5" /> Salva Test</button>
                 </div>
              </div>
            </div>

            {/* RESULTS DASHBOARD */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Dashboard Finanziaria 2026</h2>
                 <button onClick={handleAiAdvice} disabled={isLoadingAdvice} className="flex items-center gap-3 text-white bg-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all">
                  {isLoadingAdvice ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles className="w-5 h-5" />}
                  Analisi IA Previsionale
                </button>
              </div>

              {/* KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard label="Netto Mensile 2026" value={formatEuro(results.redditoNettoMensile2026)} icon={<Wallet className="w-6 h-6" />} subValue="Previsione al netto del saldo 25" colorClass="text-emerald-700" />
                <InfoCard label="Uscita Totale 2026" value={formatEuro(results.totaleEsborso2026)} icon={<ArrowDownToLine className="w-6 h-6" />} subValue="Saldo 25 + Acconti 26" colorClass="text-red-700" />
                <InfoCard label="Accantonamento/Mese" value={formatEuro(results.accantonamentoMensileTasse)} icon={<ShieldCheck className="w-6 h-6" />} subValue="Per coprire scadenze 2026" colorClass="text-indigo-700" />
              </div>

              {/* DETTAGLIO CALCOLO FISCALE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-200 shadow-xl">
                  <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-500" /> Verifica Storica & Prospetto 2026
                  </h3>
                  <div className="space-y-4">
                     <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                        <span className="font-bold text-slate-600 uppercase text-[9px]">Saldo 2025 (Da pagare nel 26)</span>
                        <span className="font-black text-slate-900">{formatEuro(results.saldoDovuto2025)}</span>
                     </div>
                     <div className="flex justify-between text-sm py-2 border-b border-indigo-50 text-indigo-700 bg-indigo-50/20 px-3 rounded-lg">
                        <span className="font-bold italic uppercase text-[9px]">Contributi Deducibili nel 2026</span>
                        <span className="font-black">-{formatEuro(results.contributiDeducibili2026)}</span>
                     </div>
                     
                     {/* EVIDENZIATA: BASE IMPONIBILE NETTA (Richiesta visibilità) */}
                     <div className="flex justify-between text-sm py-5 px-6 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-200 my-6 transform hover:scale-[1.02] transition-transform border-4 border-indigo-400">
                        <span className="font-black uppercase text-[12px] tracking-widest text-indigo-50 flex items-center gap-3">
                           <Calculator className="w-5 h-5 opacity-70" /> Base Imponibile Netta 2026
                        </span>
                        <span className="font-black text-white text-2xl tracking-tighter">{formatEuro(results.imponibileNetto2026)}</span>
                     </div>
                     
                     <div className="mt-2 pt-4 border-t-2 border-slate-100">
                        <div className="flex justify-between text-sm py-1">
                           <span className="text-slate-500 font-bold uppercase text-[9px]">Acconti Previsti Giu/Nov 2026</span>
                           <span className="font-black text-pink-600">{formatEuro(results.accontoInps2026 + results.accontoImposta2026)}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold leading-tight mt-1 uppercase italic">
                          Gli acconti 2026 sono calcolati matematicamente sul reddito reale del 2025 (Fatturato: {formatEuro(taxData.historical.find(h=>h.year===2025)?.value || 0)}).
                        </p>
                     </div>

                     <div className="flex justify-between text-sm py-4 pt-6 border-t-4 border-emerald-50 mt-4">
                        <span className="font-black text-emerald-800 uppercase tracking-tighter text-sm">Disponibilità Netta 2026</span>
                        <span className="font-black text-emerald-700 text-3xl tracking-tighter">{formatEuro(results.redditoNettoAnnuale2026)}</span>
                     </div>
                  </div>
                </div>

                {/* GRAFICO TREND STORICO VS PREVISIONE */}
                <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-200 shadow-xl flex flex-col">
                  <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-8 text-center">Analisi Comparativa Fatturato & Tasse</h3>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicalDataForChart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="anno" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                        <Bar dataKey="fatturato" name="Lordo Realizzato/Stimato" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="tasse" name="Uscita Fiscale Effettiva" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AI INSIGHTS & ADVICE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {aiAdvice && (
                    <section className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl border-4 border-indigo-900 animate-in fade-in zoom-in duration-500">
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                        <h3 className="font-black text-white text-lg tracking-tight uppercase">Analisi Strategica IA</h3>
                      </div>
                      <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-line font-bold border-l-4 border-indigo-600 pl-5 py-2">
                        {aiAdvice}
                      </div>
                    </section>
                 )}
                 <div className="space-y-6">
                    <div className="bg-emerald-50 p-7 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm">
                       <h4 className="font-black text-emerald-900 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                         <CheckCircle2 className="w-5 h-5" /> Test di Precisione
                       </h4>
                       <p className="text-xs text-emerald-700 font-bold leading-relaxed">
                         Questa modalità 2026 usa il 2025 come base storica consolidata. Se i calcoli del Saldo 2025 corrispondono a quanto previsto dal tuo commercialista, la proiezione per il 2026 sarà estremamente affidabile.
                       </p>
                    </div>
                    {results.creditoMaturato2025 > 0 && (
                      <div className="p-7 bg-blue-50 border-4 border-blue-200 rounded-[2.5rem] flex gap-4 text-blue-950 shadow-lg">
                        <AlertCircle className="w-8 h-8 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="font-black text-sm uppercase">Credito maturato nel 2025</p>
                          <p className="text-xs font-bold mt-1">Il calcolo indica un credito di {formatEuro(results.creditoMaturato2025)}. Questo accade perché gli acconti 2025 (basati sul 2024) erano superiori al dovuto reale del 2025.</p>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-16 text-center text-slate-500 text-[10px] border-t-2 border-slate-200 uppercase tracking-widest font-black bg-white px-4">
        <p>&copy; 2026 Forfettario Pro Elite AI - Simulatore di Verifica e Previsione</p>
        <p className="mt-4 text-slate-400 font-bold max-w-xl mx-auto italic">Nota: i calcoli simulano il versamento per cassa dei contributi e l'applicazione del metodo storico per gli acconti.</p>
      </footer>
    </div>
  );
};

export default App;

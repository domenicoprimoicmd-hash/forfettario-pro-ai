
import React from 'react';
import { Trash2, ExternalLink, Calendar, TrendingUp, Wallet, Clock } from 'lucide-react';
import { SavedScenario } from '../types';

interface DashboardProps {
  scenarios: SavedScenario[];
  onDelete: (id: string) => void;
  onLoad: (scenario: SavedScenario) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ scenarios, onDelete, onLoad }) => {
  const formatEuro = (val: number) => 
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-200 shadow-inner mt-8">
        <div className="bg-slate-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Clock className="w-14 h-14 text-slate-300" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Il tuo archivio è vuoto</h3>
        <p className="text-slate-600 max-w-md mx-auto font-bold text-lg">Salva i tuoi scenari fiscali dal pannello di calcolo per confrontarli in questa sezione. Tutti i dati sono salvati esclusivamente sul tuo browser.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700 mt-8">
      {scenarios.map((s) => (
        <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-lg hover:shadow-2xl transition-all group border-b-8 border-b-indigo-100 hover:-translate-y-2">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none mb-2">{s.name}</h3>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {new Date(s.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button 
                onClick={() => onLoad(s)}
                className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-md active:scale-90"
                title="Carica questo scenario"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(s.id)}
                className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-90"
                title="Elimina permanentemente"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-8">
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-widest">Fatturato</p>
              <p className="font-black text-slate-950 text-xl tracking-tight">{formatEuro(s.taxData.fatturato)}</p>
            </div>
            <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm">
              <p className="text-[10px] uppercase font-black text-emerald-600 mb-1.5 tracking-widest">Netto Mese</p>
              <p className="font-black text-emerald-700 text-xl tracking-tight">{formatEuro(s.results.redditoNettoMensile)}</p>
            </div>
          </div>

          <div className="pt-6 border-t-4 border-slate-50 flex items-center justify-between text-[11px] font-black uppercase text-slate-500 tracking-tighter">
            <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Incidenza: {s.results.percentualeCaricoFiscale.toFixed(1)}%
            </span>
            <span className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl text-red-600 border border-red-100">
              {/* Fix: Changed s.results.tasseTotali to s.results.tasseTotaliSaldo to match CalculationResult type */}
              <Wallet className="w-4 h-4" /> Tasse: {formatEuro(s.results.tasseTotaliSaldo)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

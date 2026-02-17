
export interface HistoricalTurnover {
  year: number;
  value: number;
}

export interface TaxData {
  fatturato2026: number;
  // Added fatturato property to resolve geminiService error
  fatturato?: number;
  coefficiente: number;
  aliquota: 5 | 15;
  inpsRate: number;
  deduzioni: number;
  historical: HistoricalTurnover[];
}

export interface CalculationResult {
  // Dati 2025 (Verifica Storica)
  imponibile2025: number;
  tasseTotali2025: number;
  saldoDovuto2025: number; // Saldo da pagare nel 2026
  creditoMaturato2025: number; // Eventuale credito da usare nel 2026
  
  // Dati 2026 (Previsione)
  redditoLordo2026: number;
  imponibileLordo2026: number;
  contributiDeducibili2026: number; // Quelli versati nel 2026 (Saldo 25 + Acconti 26)
  imponibileNetto2026: number;
  
  // Esborso Finanziario 2026
  accontoInps2026: number;
  accontoImposta2026: number;
  totaleEsborso2026: number; // Saldo 25 + Acconti 26
  
  redditoNettoAnnuale2026: number;
  redditoNettoMensile2026: number;
  percentualeCaricoFiscale: number;

  // Added properties to resolve property access errors in App.tsx, Dashboard.tsx and geminiService.ts
  accantonamentoMensileTasse: number;
  contributiInpsSaldo: number;
  impostaSostitutivaSaldo: number;
  redditoNettoMensile: number;
  tasseTotaliSaldo: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  date: string;
  taxData: TaxData;
  results: CalculationResult;
}

export interface AtecoActivity {
  code: string;
  name: string;
  coefficient: number;
}

// Added missing User interface to resolve AuthModal.tsx error
export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
}

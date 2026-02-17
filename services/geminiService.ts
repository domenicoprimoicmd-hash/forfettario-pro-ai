
import { GoogleGenAI } from "@google/genai";
import { TaxData, CalculationResult } from "../types";

export const getTaxAdvice = async (taxData: TaxData, results: CalculationResult): Promise<string> => {
  // Always initialize with named parameters and use process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fix: Updated results.contributiInps to results.contributiInpsSaldo and results.impostaSostitutiva to results.impostaSostitutivaSaldo
  const prompt = `
    Analizza la seguente situazione fiscale per un professionista in Regime Forfettario in Italia:
    - Fatturato Annuo: €${taxData.fatturato}
    - Coefficiente di Redditività: ${taxData.coefficiente}%
    - Aliquota Imposta: ${taxData.aliquota}%
    - Contributi INPS calcolati: €${results.contributiInpsSaldo.toFixed(2)}
    - Imposta Sostitutiva: €${results.impostaSostitutivaSaldo.toFixed(2)}
    - Reddito Netto Mensile: €${results.redditoNettoMensile.toFixed(2)}

    Fornisci 3 consigli pratici e professionali in lingua italiana su:
    1. Gestione del flusso di cassa (accantonamenti).
    2. Possibili ottimizzazioni o avvisi sul limite dei 85.000€.
    3. Un commento sulla pressione fiscale calcolata (${results.percentualeCaricoFiscale.toFixed(1)}%).
    Sii conciso e professionale.
  `;

  try {
    // Call generateContent using gemini-3-flash-preview for text tasks with systemInstruction config
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Sei un esperto fiscalista italiano specializzato nel regime forfettario. Fornisci consigli strategici e precisi.",
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    // Access text property directly (it is a getter, not a method)
    return response.text || "Impossibile generare consigli al momento.";
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    return "Si è verificato un errore nel contattare l'assistente fiscale AI.";
  }
};

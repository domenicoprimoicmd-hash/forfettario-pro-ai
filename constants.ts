
import { AtecoActivity } from './types';

export const ATECO_ACTIVITIES: AtecoActivity[] = [
  { code: 'COM', name: 'Commercio (Ingrosso/Dettaglio)', coefficient: 40 },
  { code: 'RIST', name: 'Ristorazione e Hotel', coefficient: 40 },
  { code: 'PROF', name: 'Professionisti / Consulenti', coefficient: 78 },
  { code: 'ART', name: 'Artigiani', coefficient: 67 },
  { code: 'ALT', name: 'Altre attività economiche', coefficient: 67 },
  { code: 'COSTRUZ', name: 'Costruzioni', coefficient: 86 },
  { code: 'AGRI', name: 'Agricoltura', coefficient: 15 },
];

export const INPS_RATES = {
  GESTIONE_SEPARATA: 26.07,
  ARTIGIANI: 24.48,
  COMMERCIANTI: 24.48,
};

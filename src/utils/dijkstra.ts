/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScenarioId, CommuterReport, TransitRouteResult, ReportLeg, FareInfo } from '../types';

/**
 * Stop coordinates shared with the live map (OpenStreetMap tiles).
 */
const STOPS: Record<string, { name: string; lat: number; long: number }> = {
  ukonga: { name: 'Ukonga', lat: -6.8306, long: 39.2800 },
  morocco: { name: 'Morocco DART Terminal', lat: -6.7702, long: 39.2450 },
  ubungo: { name: 'Ubungo Interchange', lat: -6.7845, long: 39.2965 },
  kivukoni: { name: 'Kivukoni Ferry Terminal', lat: -6.7760, long: 39.2180 },
  kariakoo_gerezani: { name: 'Kariakoo Gerezani', lat: -6.7615, long: 39.2620 },
  mlelani: { name: 'Mlelani Street', lat: -6.7300, long: 39.2650 },
  masaki: { name: 'Masaki Junction', lat: -6.7120, long: 39.3120 },
  otrong_tire: { name: "Otrong'i Tire", lat: -6.7380, long: 39.2825 },
  mikocheni: { name: 'Mikocheni Road', lat: -6.7540, long: 39.2830 },
  damoni: { name: 'Damoni Circle', lat: -6.7510, long: 39.2880 },
  tegeta_mwenge: { name: 'Tegeta-Mwenge Daladala Hub', lat: -6.8000, long: 39.2500 },
  mzizima: { name: 'Mzizima DART Stop', lat: -6.7995, long: 39.3070 },
  // --- Extended network: real Dar es Salaam locations ---
  magomeni: { name: 'Magomeni', lat: -6.7860, long: 39.2560 },
  sunny_side: { name: 'Sunny Side (Kinondoni)', lat: -6.7830, long: 39.2790 },
  slipway: { name: 'Slipway Waterfront', lat: -6.7070, long: 39.2930 },
  coco_beach: { name: 'Coco Beach (Oysterbay)', lat: -6.7200, long: 39.3060 },
  sinza: { name: 'Sinza Mori', lat: -6.7800, long: 39.3100 },
  kimara: { name: 'Kimara Corner', lat: -6.7690, long: 39.3430 },
  mbezi: { name: 'Mbezi Beach', lat: -6.7610, long: 39.3720 },
  mbagala: { name: 'Mbagala', lat: -6.7980, long: 39.2790 },
  tmj: { name: 'Tandika-Mjimwema Rd (Kigamboni)', lat: -6.8090, long: 39.2310 },
  gerezani_terminus: { name: 'Gerezani Ferry Terminus', lat: -6.7640, long: 39.2560 },
  // --- Corridor stops following real Dar es Salaam roads ---
  kurasini: { name: 'Kurasini', lat: -6.7950, long: 39.2600 },
  mtoni: { name: 'Mtoni', lat: -6.7940, long: 39.2720 },
  changombe: { name: "Chang'ombe", lat: -6.7960, long: 39.2660 },
  temeke: { name: 'Temeke Mjini', lat: -6.8160, long: 39.2840 },
  mabibo: { name: 'Mabibo', lat: -6.7950, long: 39.3050 },
  mlimani: { name: 'Mlimani (UDSM)', lat: -6.7690, long: 39.2870 },
  magufuli_terminal: { name: 'Magufuli Bus Terminal', lat: -6.7870, long: 39.2990 },
  gongo: { name: 'Gongo la Mboto', lat: -6.7950, long: 39.3170 },
  // --- Tabata micro-areas (daladala stages on Nyerere Rd) ---
  tabata_kimanga: { name: 'Tabata Kimanga', lat: -6.7840, long: 39.2650 },
  tabata_a: { name: 'Tabata A', lat: -6.7910, long: 39.2640 },
  tabata_b: { name: 'Tabata B', lat: -6.7930, long: 39.2700 },
  tabata_keko: { name: 'Tabata Keko', lat: -6.7900, long: 39.2750 },
  tabata_dk: { name: 'Tabata DK', lat: -6.7940, long: 39.2660 },
  tabata_changombe: { name: "Tabata Chang'ombe", lat: -6.7970, long: 39.2700 },
  segerea: { name: 'Tabata Segerea', lat: -6.8150, long: 39.2650 },
  // --- Remote terminal hubs (real daladala termini from OSM route survey) ---
  banana: { name: 'Banana (Msimbazi river)', lat: -6.7990, long: 39.3230 },
  rangi3: { name: 'Mbagala Rangi 3', lat: -6.8060, long: 39.2920 },
  mtoni_mtongani: { name: 'Mtoni Mtongani', lat: -6.8010, long: 39.2750 },
  kiburugwa: { name: 'Kiburugwa', lat: -6.8120, long: 39.2860 },
  viwandani: { name: 'Viwandani (Yombo Vituka)', lat: -6.8220, long: 39.3030 },
  machimbo: { name: 'Machimbo', lat: -6.8290, long: 39.3150 },
  mwanagati: { name: 'Mwanagati', lat: -6.8340, long: 39.3090 },
  kwa_moshi: { name: 'Kwa Moshi', lat: -6.8450, long: 39.3050 },
  kongowe: { name: 'Kongowe (Temeke)', lat: -6.8070, long: 39.2780 },
  kibugumo: { name: 'Kibugumo', lat: -6.8160, long: 39.2550 },
  gezaulole: { name: 'Gezaulole', lat: -6.8250, long: 39.2560 },
  kimbiji: { name: 'Kimbiji', lat: -6.8550, long: 39.2620 },
  kisiwani: { name: 'Kisiwani', lat: -6.8350, long: 39.2350 },
  vijibweni: { name: 'Vijibweni', lat: -6.8450, long: 39.2470 },
  somangila: { name: 'Somangila', lat: -6.8800, long: 39.2700 },
  bunju: { name: 'Bunju', lat: -6.7410, long: 39.3480 },
  charambe: { name: 'Charambe', lat: -6.8000, long: 39.2730 },
  boko: { name: 'Boko', lat: -6.7270, long: 39.3180 },
  mbande: { name: 'Mbande', lat: -6.7330, long: 39.3380 },
  kibamba: { name: 'Kibamba', lat: -6.7540, long: 39.3620 },
  kiluvya: { name: 'Kiluvya', lat: -6.7480, long: 39.3920 },
  goba: { name: 'Goba', lat: -6.7650, long: 39.3700 },
  mbezi_mwisho: { name: 'Mbezi Mwisho (Njia Panda)', lat: -6.7710, long: 39.3620 },
  kitunda: { name: 'Kitunda', lat: -6.8170, long: 39.2930 },
  chanika: { name: 'Chanika', lat: -6.8130, long: 39.2900 },
  // --- City center & inner districts ---
  posta: { name: 'Posta (City Center)', lat: -6.7720, long: 39.2280 },
  kariakoo_market: { name: 'Kariakoo Market', lat: -6.7680, long: 39.2660 },
  muhimbili: { name: 'Muhimbili National Hospital', lat: -6.7720, long: 39.2730 },
  msimbazi: { name: 'Msimbazi / Jangwani Bridge', lat: -6.7760, long: 39.2790 },
  buguruni: { name: 'Buguruni', lat: -6.7800, long: 39.2930 },
  ilala: { name: 'Ilala Boma', lat: -6.7860, long: 39.2740 },
  manzese: { name: 'Manzese Market', lat: -6.7770, long: 39.3190 },
  mwenge: { name: 'Mwenge Woodcarvers Hub', lat: -6.7600, long: 39.2700 },
  // --- Coastal & outer districts ---
  msasani: { name: 'Msasani Peninsula', lat: -6.7330, long: 39.2980 },
  kawe: { name: 'Kawe', lat: -6.7570, long: 39.3150 },
  tazara: { name: 'Tazara Railway Station', lat: -6.7920, long: 39.3010 },
  tabata: { name: 'Tabata', lat: -6.7940, long: 39.2660 },
};

export { STOPS as STOP_COORDS };

export const STOP_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STOPS).map(([id, s]) => [id, s.name])
);

// Rough road transit edges (minutes, TZS) — daladala tiers: 700 minimum,
// 800 short-haul, 900–1000 medium, 1200 long; DART flat 650 card fare.
const EDGES: Array<{ from: string; to: string; baseMinutes: number; basePriceTzs: number; label: string }> = [
  { from: 'morocco', to: 'kariakoo_gerezani', baseMinutes: 7, basePriceTzs: 650, label: 'DART M1' },
  { from: 'kariakoo_gerezani', to: 'mlelani', baseMinutes: 12, basePriceTzs: 1000, label: 'Daladala quickline' },
  { from: 'mlelani', to: 'kivukoni', baseMinutes: 15, basePriceTzs: 700, label: 'DAR ferry shuttle' },
  { from: 'kivukoni', to: 'morocco', baseMinutes: 18, basePriceTzs: 650, label: 'DART M4 ferry connector' },
  { from: 'morocco', to: 'ubungo', baseMinutes: 15, basePriceTzs: 1000, label: 'Daladala Mwenge' },
  { from: 'ubungo', to: 'mzizima', baseMinutes: 20, basePriceTzs: 650, label: 'DART M2' },
  { from: 'mzizima', to: 'masaki', baseMinutes: 10, basePriceTzs: 700, label: 'Daladala Masaki' },
  { from: 'masaki', to: 'mikocheni', baseMinutes: 14, basePriceTzs: 800, label: 'Daladala Gongo La Mboto' },
  { from: 'mikocheni', to: 'damoni', baseMinutes: 9, basePriceTzs: 700, label: 'Local shuttle' },
  { from: 'damoni', to: 'tegeta_mwenge', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Tegeta' },
  { from: 'tegeta_mwenge', to: 'mikocheni', baseMinutes: 12, basePriceTzs: 800, label: 'Daladala backhaul' },
  { from: 'mikocheni', to: 'kariakoo_gerezani', baseMinutes: 15, basePriceTzs: 1000, label: 'Daladala Kariakoo' },
  { from: 'kariakoo_gerezani', to: 'morocco', baseMinutes: 7, basePriceTzs: 650, label: 'DART M1 return' },
  { from: 'otrong_tire', to: 'mlelani', baseMinutes: 11, basePriceTzs: 800, label: 'Daladala Masaki' },
  { from: 'ukonga', to: 'tegeta_mwenge', baseMinutes: 13, basePriceTzs: 1000, label: 'Daladala Ukonga' },
  { from: 'ukonga', to: 'mikocheni', baseMinutes: 16, basePriceTzs: 1200, label: 'Daladala Mikocheni' },
  // --- Extended network edges ---
  { from: 'kariakoo_gerezani', to: 'magomeni', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Magomeni' },
  { from: 'magomeni', to: 'morocco', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Morocco line' },
  { from: 'magomeni', to: 'sunny_side', baseMinutes: 7, basePriceTzs: 800, label: 'Daladala Sunny Side' },
  { from: 'sunny_side', to: 'ubungo', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Ubungo feeder' },
  { from: 'sunny_side', to: 'sinza', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Sinza' },
  { from: 'sinza', to: 'mzizima', baseMinutes: 12, basePriceTzs: 900, label: 'Daladala Mzizima link' },
  { from: 'sinza', to: 'kimara', baseMinutes: 14, basePriceTzs: 1000, label: 'Daladala Kimara' },
  { from: 'kimara', to: 'mbezi', baseMinutes: 15, basePriceTzs: 1200, label: 'Daladala Mbezi Beach' },
  { from: 'kimara', to: 'ubungo', baseMinutes: 16, basePriceTzs: 1000, label: 'Daladala Ubungo express' },
  { from: 'masaki', to: 'coco_beach', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Oysterbay' },
  { from: 'coco_beach', to: 'mikocheni', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Mikocheni B' },
  { from: 'masaki', to: 'slipway', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Slipway' },
  { from: 'slipway', to: 'otrong_tire', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Toure Drive' },
  { from: 'mikocheni', to: 'sinza', baseMinutes: 11, basePriceTzs: 800, label: 'Daladala Mwenge-Sinza' },
  // (removed: Tegeta→Mbagala — geographically wrong, they are on opposite sides of the city)
  { from: 'mbagala', to: 'kariakoo_gerezani', baseMinutes: 14, basePriceTzs: 1000, label: 'Daladala Chang\u2019ombe' },
  { from: 'kivukoni', to: 'gerezani_terminus', baseMinutes: 6, basePriceTzs: 700, label: 'Kigamboni ferry crossing' },
  { from: 'gerezani_terminus', to: 'kariakoo_gerezani', baseMinutes: 5, basePriceTzs: 700, label: 'Gerezani link daladala' },
  { from: 'kivukoni', to: 'tmj', baseMinutes: 20, basePriceTzs: 1200, label: 'Daladala Kigamboni town' },
  // --- City center & inner districts ---
  { from: 'kivukoni', to: 'posta', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Posta' },
  { from: 'posta', to: 'kariakoo_market', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Kariakoo line' },
  { from: 'kariakoo_market', to: 'kariakoo_gerezani', baseMinutes: 5, basePriceTzs: 700, label: 'Kariakoo link' },
  { from: 'kariakoo_market', to: 'muhimbili', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Muhimbili' },
  { from: 'muhimbili', to: 'msimbazi', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Morogoro line' },
  { from: 'msimbazi', to: 'ubungo', baseMinutes: 12, basePriceTzs: 650, label: 'DART M3 Morogoro' },
  { from: 'msimbazi', to: 'buguruni', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Buguruni' },
  { from: 'buguruni', to: 'mzizima', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Mzizima feeder' },
  { from: 'ilala', to: 'msimbazi', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Ilala' },
  { from: 'ilala', to: 'tabata', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Tabata' },
  { from: 'tabata', to: 'mbagala', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Nelson Mandela' },
  { from: 'tabata', to: 'tazara', baseMinutes: 12, basePriceTzs: 900, label: 'Daladala Tazara' },
  { from: 'tazara', to: 'ubungo', baseMinutes: 7, basePriceTzs: 800, label: 'Daladala Ubungo link' },
  { from: 'tazara', to: 'mzizima', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Tazara-Mzizima' },
  { from: 'manzese', to: 'ubungo', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Manzese' },
  { from: 'manzese', to: 'kimara', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Morogoro express' },
  { from: 'mwenge', to: 'morocco', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Mwenge-Morocco' },
  { from: 'mwenge', to: 'mikocheni', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Mwenge-Mikocheni' },
  { from: 'mwenge', to: 'kariakoo_market', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Mwenge-Kariakoo' },
  // --- Kawawa Rd corridor (BRT Phase 2 route): Kariakoo→Kurasini→Mtoni→Chang'ombe→Mbagala→Temeke ---
  { from: 'kariakoo_market', to: 'kurasini', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Kawawa line' },
  { from: 'kurasini', to: 'mtoni', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Mtoni' },
  { from: 'mtoni', to: 'changombe', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Chang’ombe' },
  { from: 'changombe', to: 'mbagala', baseMinutes: 7, basePriceTzs: 800, label: 'Daladala Mbagala' },
  { from: 'mbagala', to: 'temeke', baseMinutes: 12, basePriceTzs: 900, label: 'Daladala Temeke' },
  // --- Nyerere Rd (airport corridor): Chang'ombe→Ukonga---
  { from: 'changombe', to: 'ukonga', baseMinutes: 12, basePriceTzs: 1000, label: 'Daladala Nyerere Rd' },
  // --- Nelson Mandela Rd: Mbagala→Tazara→Mabibo→Ubungo ---
  { from: 'mbagala', to: 'tazara', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Mandela Rd' },
  { from: 'tazara', to: 'mabibo', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Mabibo' },
  { from: 'mabibo', to: 'ubungo', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Ubungo link' },
  // --- Mlimani / Magufuli Terminal cluster (Sam Nujoma axis) ---
  { from: 'mwenge', to: 'mlimani', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Mlimani' },
  { from: 'mlimani', to: 'ubungo', baseMinutes: 9, basePriceTzs: 650, label: 'DART M5 feeder' },
  { from: 'mlimani', to: 'magufuli_terminal', baseMinutes: 5, basePriceTzs: 700, label: 'Magufuli terminal shuttle' },
  { from: 'magufuli_terminal', to: 'ubungo', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Ubungo feeder' },
  { from: 'magufuli_terminal', to: 'sinza', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Sinza' },
  // --- Bagamoyo Rd proper: Mwenge→Tegeta ---
  { from: 'mwenge', to: 'tegeta_mwenge', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Bagamoyo Rd' },
  // --- Pugu Rd: Buguruni→Gongo la Mboto→Ukonga ---
  { from: 'buguruni', to: 'gongo', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Gongo la Mboto' },
  { from: 'gongo', to: 'ukonga', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Ukonga-Pugu Rd' },
  // --- Nyerere Rd stages: Kimanga→Ilala Boma→Tabata A→DK→B→Keko→Chang'ombe→Segerea ---
  { from: 'kariakoo_market', to: 'tabata_kimanga', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Kimanga' },
  { from: 'tabata_kimanga', to: 'ilala', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Ilala stage' },
  { from: 'ilala', to: 'tabata_a', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Tabata A' },
  { from: 'tabata_a', to: 'tabata_dk', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Tabata DK' },
  { from: 'tabata_dk', to: 'tabata_b', baseMinutes: 3, basePriceTzs: 700, label: 'Daladala Tabata B' },
  { from: 'tabata_b', to: 'tabata_keko', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Tabata Keko' },
  { from: 'tabata_keko', to: 'tabata_changombe', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Tabata Chang’ombe' },
  { from: 'tabata_changombe', to: 'changombe', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Chang’ombe link' },
  { from: 'tabata_changombe', to: 'segerea', baseMinutes: 13, basePriceTzs: 900, label: 'Daladala Segerea' },
  { from: 'tabata_dk', to: 'tabata', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Tabata stage' },
  // --- Real daladala route structure (terminal pairs from OSM survey) ---
  // Southern Ilala belt: Banana is the Kitunda/Chanika zone hub
  { from: 'gongo', to: 'chanika', baseMinutes: 7, basePriceTzs: 800, label: 'Gongo–Chanika' },
  { from: 'chanika', to: 'banana', baseMinutes: 6, basePriceTzs: 700, label: 'Chanika–Banana' },
  { from: 'kitunda', to: 'banana', baseMinutes: 8, basePriceTzs: 700, label: 'Daladala Banana line' },
  { from: 'kitunda', to: 'gongo', baseMinutes: 7, basePriceTzs: 700, label: 'Kitunda–Gongo' },
  // Real route 18: Buguruni–Yombo Vituka/Viwandani
  { from: 'buguruni', to: 'viwandani', baseMinutes: 12, basePriceTzs: 900, label: 'Buguruni–Viwandani' },
  { from: 'banana', to: 'viwandani', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Viwandani' },
  { from: 'banana', to: 'machimbo', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Machimbo' },
  { from: 'banana', to: 'mwanagati', baseMinutes: 12, basePriceTzs: 800, label: 'Daladala Mwanagati' },
  { from: 'mwanagati', to: 'kwa_moshi', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Kwa Moshi' },
  { from: 'banana', to: 'kwa_moshi', baseMinutes: 18, basePriceTzs: 1000, label: 'Banana–Kwa Moshi express' },
  // Mbagala Rangi 3 hub (Temeke)
  { from: 'mbagala', to: 'rangi3', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Rangi 3 stage' },
  { from: 'rangi3', to: 'kiburugwa', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Kiburugwa' },
  { from: 'rangi3', to: 'kongowe', baseMinutes: 9, basePriceTzs: 800, label: 'Rangi 3–Kongowe' },
  { from: 'rangi3', to: 'temeke', baseMinutes: 10, basePriceTzs: 800, label: 'Rangi 3–Temeke' },
  { from: 'rangi3', to: 'charambe', baseMinutes: 6, basePriceTzs: 700, label: 'Rangi 3–Charambe' },
  // Mtoni Mtongani branch
  { from: 'gongo', to: 'mtoni_mtongani', baseMinutes: 8, basePriceTzs: 800, label: 'Gongo–Mtoni Mtongani' },
  // Gongo la Mboto radial (real: Gongo–Mwenge via Sam Nujoma)
  { from: 'gongo', to: 'mbezi_mwisho', baseMinutes: 12, basePriceTzs: 900, label: 'Gongo–Mbezi Mwisho' },
  { from: 'mbezi_mwisho', to: 'kibamba', baseMinutes: 8, basePriceTzs: 800, label: 'Mbezi Mwisho–Kibamba' },
  { from: 'kibamba', to: 'goba', baseMinutes: 7, basePriceTzs: 800, label: 'Kibamba–Goba' },
  { from: 'kibamba', to: 'kiluvya', baseMinutes: 9, basePriceTzs: 800, label: 'Kibamba–Kiluvya' },
  // Kinondoni remote coast (real: Makumbusho–Ununio, Boko–Mbezi Beach)
  { from: 'kawe', to: 'ubungo', baseMinutes: 12, basePriceTzs: 800, label: 'Kawe–Ubungo' },
  { from: 'kawe', to: 'boko', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Boko line' },
  { from: 'bunju', to: 'kibamba', baseMinutes: 7, basePriceTzs: 800, label: 'Bunju–Kibamba' },
  { from: 'boko', to: 'mbande', baseMinutes: 7, basePriceTzs: 800, label: 'Boko–Mbande' },
  { from: 'mbande', to: 'bunju', baseMinutes: 8, basePriceTzs: 800, label: 'Mbande–Bunju' },
  // Kigamboni interior branches (real terminal pairs)
  { from: 'tmj', to: 'kibugumo', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Kibugumo' },
  { from: 'kibugumo', to: 'gezaulole', baseMinutes: 8, basePriceTzs: 700, label: 'Kibugumo–Gezaulole' },
  { from: 'tmj', to: 'vijibweni', baseMinutes: 14, basePriceTzs: 800, label: 'Kigamboni–Vijibweni' },
  { from: 'kimbiji', to: 'somangila', baseMinutes: 10, basePriceTzs: 800, label: 'Kimbiji–Somangila' },
  { from: 'kimbiji', to: 'kisiwani', baseMinutes: 9, basePriceTzs: 800, label: 'Kimbiji–Kisiwani' },
  { from: 'vijibweni', to: 'kimbiji', baseMinutes: 8, basePriceTzs: 800, label: 'Vijibweni–Kimbiji' },
  // --- Coastal & outer districts ---
  { from: 'msasani', to: 'masaki', baseMinutes: 8, basePriceTzs: 700, label: 'Daladala Msasani' },
  { from: 'msasani', to: 'slipway', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Toure Drive' },
  { from: 'msasani', to: 'mikocheni', baseMinutes: 12, basePriceTzs: 800, label: 'Daladala Msasani-Mikocheni' },
  { from: 'kawe', to: 'mikocheni', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Kawe' },
  { from: 'kawe', to: 'mbezi', baseMinutes: 12, basePriceTzs: 900, label: 'Daladala Mbezi Rd' },
  { from: 'temeke', to: 'mbagala', baseMinutes: 12, basePriceTzs: 900, label: 'Daladala Temeke' },
  { from: 'temeke', to: 'tabata', baseMinutes: 16, basePriceTzs: 1000, label: 'Daladala Temeke-Tabata' },
];

/**
 * Undirected adjacency: daladala and BRT services run both ways.
 * Parallel edges between the same pair are deduped keeping the fastest.
 */
type AdjEntry = { to: string; edge: typeof EDGES[number] };
const ADJ = new Map<string, AdjEntry[]>();
for (const e of EDGES) {
  for (const [a, b] of [[e.from, e.to], [e.to, e.from]] as const) {
    const list = ADJ.get(a) ?? [];
    const existing = list.find((x) => x.to === b);
    if (!existing) {
      list.push({ to: b, edge: e });
    } else if (
      e.baseMinutes < existing.edge.baseMinutes ||
      (e.baseMinutes === existing.edge.baseMinutes && e.basePriceTzs < existing.edge.basePriceTzs)
    ) {
      existing.edge = e;
    }
    ADJ.set(a, list);
  }
}

/**
 * Fare reference used by the fare-check panel. Standards come from the
 * network data above; "typical high" reflects the unofficial hikes
 * conductors ask for during peaks, rain, and shortages.
 */
export const FARE_REFERENCE: FareInfo[] = EDGES.map((e, i) => {
  const isDart = e.label.startsWith('DART');
  return {
    id: `fare-${i}`,
    label: e.label,
    fromName: STOPS[e.from]?.name ?? e.from,
    toName: STOPS[e.to]?.name ?? e.to,
    standardTzs: e.basePriceTzs,
    typicalLowTzs: e.basePriceTzs,
    // DART is card-fixed at the gate; only cash services attract hikes.
    typicalHighTzs: isDart
      ? e.basePriceTzs
      : Math.round(e.basePriceTzs * 1.3 / 50) * 50,
    note: isDart
      ? 'BRT card fare — fixed at the terminal gate, no conductor negotiation.'
      : e.label.includes('ferry')
        ? 'Ferry fare is posted at the ramp — queue marshals can confirm.'
        : 'Daladala cash fare — citywide minimum is 700 TZS; conductors ask more at peak, night, and in rain.',
  };
});

function distanceMetres(a: typeof STOPS[string], b: typeof STOPS[string]) {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.long - a.long);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function edgeDelay(
  from: string,
  to: string,
  basePriceTzs: number,
  scenario: ScenarioId,
  reports: CommuterReport[]
): { delayMinutes: number; priceDeltaTzs: number } {
  let delayMinutes = 0;
  let priceDeltaTzs = 0;
  const keyForward = from + '-' + to;
  const keyReverse = to + '-' + from;

  for (const r of reports) {
    if (r.type === 'traffic') {
      if (r.targetId === from || r.targetId === to) {
        if (r.severity === 'high') delayMinutes += 18;
        else if (r.severity === 'medium') delayMinutes += 10;
        else delayMinutes += 4;
      }
    }
    if (r.type === 'price' && r.targetType === 'Route' && (r.targetId === keyForward || r.targetId === keyReverse)) {
      if (typeof r.priceValue === 'number') {
        // Reported fare is the new total; the surcharge is the difference from base.
        priceDeltaTzs = Math.max(priceDeltaTzs, Math.max(0, r.priceValue - basePriceTzs));
      }
    }
    if (r.type === 'condition') {
      if ((r.targetId === from || r.targetId === to) && r.severity === 'high') {
        delayMinutes += 8;
      }
    }
  }

  if (scenario === 'heavy-rain') {
    delayMinutes += 6;
  } else if (scenario === 'heavy-fog') {
    delayMinutes += 4;
  }

  return { delayMinutes, priceDeltaTzs };
}

/** Weather surcharge applied to a leg's base fare in bad scenarios. */
function scenarioSurcharge(basePriceTzs: number, scenarioId: ScenarioId): number {
  return scenarioId === 'heavy-rain' || scenarioId === 'heavy-fog'
    ? Math.ceil(basePriceTzs * 0.08)
    : 0;
}

interface PathState {
  nodes: string[];
  minutes: number;
  cost: number;
}

/**
 * Classic Dijkstra over the undirected adjacency, skipping banned edges.
 * Used to enumerate distinct alternatives deterministically (Yen-style:
 * ban the previous path's edges, re-run). Bounded and fast even on the
 * dense graph, unlike naive path enumeration.
 */
function dijkstraPath(
  startStopId: string,
  endStopId: string,
  banned: Set<string>
): string[] | null {
  const dist = new Map<string, number>([[startStopId, 0]]);
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  const queue: string[] = [startStopId];

  while (queue.length) {
    queue.sort((a, b) => (dist.get(a) ?? Infinity) - (dist.get(b) ?? Infinity));
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    if (current === endStopId) break;

    for (const adj of ADJ.get(current) ?? []) {
      if (banned.has(pairKey(current, adj.to))) continue;
      const nextDist = (dist.get(current) ?? Infinity) + adj.edge.baseMinutes;
      if (nextDist < (dist.get(adj.to) ?? Infinity)) {
        dist.set(adj.to, nextDist);
        prev.set(adj.to, current);
        queue.push(adj.to);
      }
    }
  }

  if (!visited.has(endStopId)) return null;
  const nodes = [endStopId];
  let pointer = endStopId;
  while (pointer !== startStopId) {
    const p = prev.get(pointer);
    if (!p) return null;
    nodes.unshift(p);
    pointer = p;
  }
  return nodes;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

function buildResult(
  nodes: string[],
  scenarioId: ScenarioId,
  reports: CommuterReport[]
): TransitRouteResult {
  const legs: ReportLeg[] = [];
  let totalDuration = 0;
  let totalCost = 0;
  let totalDistance = 0;

  for (let i = 0; i < nodes.length - 1; i += 1) {
    const from = nodes[i];
    const to = nodes[i + 1];
    const adj = (ADJ.get(from) ?? []).find((x) => x.to === to);
    if (!adj) break;

    const { delayMinutes, priceDeltaTzs } = edgeDelay(
      from,
      to,
      adj.edge.basePriceTzs,
      scenarioId,
      reports
    );
    const surge = scenarioSurcharge(adj.edge.basePriceTzs, scenarioId);
    const durationMinutes = adj.edge.baseMinutes + delayMinutes;
    const priceTzs = adj.edge.basePriceTzs + surge + priceDeltaTzs;

    totalDistance += distanceMetres(STOPS[from], STOPS[to]) / 1000;
    totalDuration += durationMinutes;
    totalCost += priceTzs;

    legs.push({
      from,
      to,
      mode: adj.edge.label,
      priceTzs,
      durationMinutes,
      fromName: STOPS[from]?.name,
      toName: STOPS[to]?.name,
      baseTzs: adj.edge.basePriceTzs,
      surgeTzs: surge > 0 ? surge : undefined,
      crowdHikeTzs: priceDeltaTzs > 0 ? priceDeltaTzs : undefined,
      crowdDelayMinutes: delayMinutes > 0 ? delayMinutes : undefined,
    });
  }

  return {
    start: nodes[0],
    end: nodes[nodes.length - 1],
    scenario: scenarioId,
    legs,
    duration: totalDuration,
    cost: totalCost,
    distance: Math.round(totalDistance),
  };
}

/**
 * Up to three distinct plans, ordered fastest-first, flagged
 * isFastest / isCheapest so the UI can badge them. Alternatives are
 * found Yen-style: rerun Dijkstra with the previous path's edges banned.
 */
export function calculateRouteOptions(
  startStopId: string,
  endStopId: string,
  scenarioId: ScenarioId,
  reports: CommuterReport[]
): TransitRouteResult[] {
  if (!STOPS[startStopId] || !STOPS[endStopId] || startStopId === endStopId) return [];

  const banned = new Set<string>();
  const options: TransitRouteResult[] = [];

  for (let i = 0; i < 3; i += 1) {
    const nodes = dijkstraPath(startStopId, endStopId, banned);
    if (!nodes) break;
    const result = buildResult(nodes, scenarioId, reports);
    if (result.legs.length === 0) break;
    options.push(result);
    for (let j = 0; j < nodes.length - 1; j += 1) {
      banned.add(pairKey(nodes[j], nodes[j + 1]));
    }
  }

  options.sort((a, b) => a.duration - b.duration);
  if (options.length > 0) options[0].isFastest = true;
  if (options.length > 0) {
    const cheapest = options.reduce((min, r) => (r.cost < min.cost ? r : min), options[0]);
    cheapest.isCheapest = true;
  }

  return options;
}

/** Single best route (kept for compatibility with existing callers). */
export function calculateTransitRoute(
  startStopId: string,
  endStopId: string,
  scenarioId: ScenarioId,
  reports: CommuterReport[]
): TransitRouteResult | null {
  const options = calculateRouteOptions(startStopId, endStopId, scenarioId, reports);
  if (options.length === 0) return null;
  const [best, ...rest] = options;
  return { ...best, alternatives: rest.length > 0 ? rest : undefined };
}

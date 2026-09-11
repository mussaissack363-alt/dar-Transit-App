/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScenarioId, CommuterReport, TransitRouteResult, ReportLeg, FareInfo } from '../types';

/**
 * Stop coordinates shared with the live map (OpenStreetMap tiles).
 */
const STOPS: Record<string, { name: string; lat: number; long: number }> = {
  // Coordinates verified against Wikipedia article coordinates (W) and the
  // OpenStreetMap Overpass dump (O); (E) = interpolated between verified
  // corridor anchors where no feature exists in either source.
  // --- CBD & harbor (Ilala) ---
  posta: { name: 'Posta (City Center)', lat: -6.8145, long: 39.2880 }, // O Posta bus stand
  kivukoni: { name: 'Kivukoni Ferry Terminal', lat: -6.8200, long: 39.2985 }, // O Kivukoni bus station
  kariakoo_market: { name: 'Kariakoo Market', lat: -6.8200, long: 39.2730 }, // W Kariakoo
  kariakoo_gerezani: { name: 'Kariakoo Gerezani', lat: -6.8256, long: 39.2734 }, // O Gerezani terminal
  muhimbili: { name: 'Muhimbili National Hospital', lat: -6.8077, long: 39.2722 }, // W
  msimbazi: { name: 'Msimbazi / Jangwani Bridge', lat: -6.8110, long: 39.2680 }, // O Jangwani stop
  ilala: { name: 'Ilala Boma', lat: -6.8270, long: 39.2645 }, // O Ilala Sokoni
  morocco: { name: 'Morocco DART Terminal', lat: -6.7781, long: 39.2735 }, // O Morocco bus stand
  mzizima: { name: 'Mzizima DART Stop', lat: -6.8215, long: 39.2775 }, // E Mzizima st, Kariakoo
  gerezani_terminus: { name: 'Gerezani Ferry Terminus', lat: -6.8232, long: 39.2997 }, // E Kigamboni landing
  kurasini: { name: 'Kurasini', lat: -6.8305, long: 39.2861 }, // W
  mtoni: { name: 'Mtoni', lat: -6.8420, long: 39.2800 }, // E Kawawa Rd
  mtoni_mtongani: { name: 'Mtoni Mtongani', lat: -6.8520, long: 39.2700 }, // E
  changombe: { name: "Chang'ombe", lat: -6.8399, long: 39.2655 }, // W
  temeke: { name: 'Temeke Mjini', lat: -6.9020, long: 39.2770 }, // E Kawawa Rd south
  tazara: { name: 'Tazara Railway Station', lat: -6.8447, long: 39.2448 }, // O Tazara stop
  mabibo: { name: 'Mabibo', lat: -6.8200, long: 39.2250 }, // E Mandela Rd
  magufuli_terminal: { name: 'Magufuli Bus Terminal', lat: -6.7846, long: 39.1088 }, // W+O (Mbezi Luis, far west)
  // --- Nyerere Rd & Tabata stages (daladala stage names) ---
  tabata_kimanga: { name: 'Tabata Kimanga', lat: -6.8280, long: 39.2025 }, // O bus station
  tabata: { name: 'Tabata', lat: -6.8301, long: 39.2265 }, // O ward
  tabata_a: { name: 'Tabata A', lat: -6.8286, long: 39.2313 }, // O Tabata Aroma
  tabata_dk: { name: 'Tabata DK', lat: -6.8270, long: 39.2380 }, // E
  tabata_b: { name: 'Tabata B', lat: -6.8255, long: 39.2450 }, // E
  tabata_keko: { name: 'Tabata Keko', lat: -6.8240, long: 39.2520 }, // E
  tabata_changombe: { name: "Tabata Chang'ombe", lat: -6.8300, long: 39.2560 }, // E
  segerea: { name: 'Tabata Segerea', lat: -6.8437, long: 39.2014 }, // W Segerea
  // --- Pugu Rd southern belt (Ilala) ---
  gongo: { name: 'Gongo la Mboto', lat: -6.8820, long: 39.1568 }, // O bus stop
  chanika: { name: 'Chanika', lat: -6.8900, long: 39.1800 }, // E Pugu Rd
  kitunda: { name: 'Kitunda', lat: -6.8978, long: 39.1956 }, // W
  banana: { name: 'Banana (Msimbazi river)', lat: -6.8713, long: 39.1892 }, // O bus station
  viwandani: { name: 'Viwandani (Yombo Vituka)', lat: -6.8499, long: 39.2453 }, // W Yombo Vituka
  machimbo: { name: 'Machimbo', lat: -6.9036, long: 39.1838 }, // O bus station
  mwanagati: { name: 'Mwanagati', lat: -6.9125, long: 39.2138 }, // O bus station
  kwa_moshi: { name: 'Kwa Moshi', lat: -6.9250, long: 39.2250 }, // E
  // --- Mbagala / Temeke (Kawawa & Rangi 3 hub) ---
  mbagala: { name: 'Mbagala', lat: -6.8999, long: 39.2660 }, // W
  rangi3: { name: 'Mbagala Rangi 3', lat: -6.9174, long: 39.2703 }, // O bus station
  kiburugwa: { name: 'Kiburugwa', lat: -6.9048, long: 39.2510 }, // W
  kongowe: { name: 'Kongowe (Temeke)', lat: -6.9543, long: 39.2832 }, // O bus station
  charambe: { name: 'Charambe', lat: -6.9196, long: 39.2566 }, // W
  ukonga: { name: 'Ukonga', lat: -6.8764, long: 39.1714 }, // W
  // --- Morogoro Rd corridor (runs WEST from the city) ---
  buguruni: { name: 'Buguruni', lat: -6.8384, long: 39.2436 }, // O suburb
  manzese: { name: 'Manzese Market', lat: -6.7971, long: 39.2337 }, // W
  ubungo: { name: 'Ubungo Interchange', lat: -6.7936, long: 39.2097 }, // O suburb
  kimara: { name: 'Kimara Corner', lat: -6.7960, long: 39.1807 }, // O Kimara suburb
  mbezi_mwisho: { name: 'Mbezi Mwisho (Njia Panda)', lat: -6.7869, long: 39.1660 }, // O Kimara Mwisho stn
  kiluvya: { name: 'Kiluvya', lat: -6.7900, long: 39.0780 }, // E Morogoro Rd
  kibamba: { name: 'Kibamba', lat: -6.7750, long: 39.0600 }, // W (approx)
  goba: { name: 'Goba', lat: -6.7404, long: 39.1612 }, // O village
  // --- Sam Nujoma / Mlimani (Ubungo) ---
  mlimani: { name: 'Mlimani (UDSM)', lat: -6.7714, long: 39.2210 }, // O Mlimani City stop
  sinza: { name: 'Sinza Mori', lat: -6.7778, long: 39.2287 }, // O bus stop
  mwenge: { name: 'Mwenge Woodcarvers Hub', lat: -6.7650, long: 39.2294 }, // O bus station
  // --- Bagamoyo Rd coastal north (Kinondoni) ---
  tegeta_mwenge: { name: 'Tegeta-Mwenge Daladala Hub', lat: -6.7500, long: 39.1900 }, // E Bagamoyo Rd
  kawe: { name: 'Kawe', lat: -6.7382, long: 39.2295 }, // O bus station
  boko: { name: 'Boko', lat: -6.7160, long: 39.2060 }, // E
  mbande: { name: 'Mbande', lat: -6.7060, long: 39.1990 }, // E
  bunju: { name: 'Bunju', lat: -6.6800, long: 39.1570 }, // E Bagamoyo Rd
  mbezi: { name: 'Mbezi Beach', lat: -6.7100, long: 39.1850 }, // E coast
  // --- Msasani peninsula (Kinondoni) ---
  mikocheni: { name: 'Mikocheni Road', lat: -6.7490, long: 39.2450 }, // O Mikocheni B
  mlelani: { name: 'Mlelani Street', lat: -6.7560, long: 39.2520 }, // E Mikocheni A
  damoni: { name: 'Damoni Circle', lat: -6.7420, long: 39.2560 }, // E
  sunny_side: { name: 'Sunny Side (Kinondoni)', lat: -6.7840, long: 39.2710 }, // O Kinondoni ward
  magomeni: { name: 'Magomeni', lat: -6.8058, long: 39.2584 }, // O bus station
  msasani: { name: 'Msasani Peninsula', lat: -6.7489, long: 39.2814 }, // O suburb
  masaki: { name: 'Masaki Junction', lat: -6.7414, long: 39.2800 }, // O bus stop
  slipway: { name: 'Slipway Waterfront', lat: -6.7247, long: 39.2863 }, // O
  otrong_tire: { name: "Otrong'i Tire", lat: -6.7300, long: 39.2900 }, // E Toure Dr
  coco_beach: { name: 'Coco Beach (Oysterbay)', lat: -6.7220, long: 39.2930 }, // E
  // --- Kigamboni ---
  tmj: { name: 'Tandika (Kigamboni)', lat: -6.8704, long: 39.2559 }, // W Tandika
  kibugumo: { name: 'Kibugumo', lat: -6.8675, long: 39.3674 }, // O village
  gezaulole: { name: 'Gezaulole', lat: -6.8850, long: 39.3750 }, // E east coast
  kisiwani: { name: 'Kisiwani', lat: -6.8635, long: 39.3222 }, // O bus station
  vijibweni: { name: 'Vijibweni', lat: -6.8617, long: 39.3199 }, // W
  kimbiji: { name: 'Kimbiji', lat: -6.9894, long: 39.5289 }, // O bus stop
  somangila: { name: 'Somangila', lat: -6.8952, long: 39.4797 }, // W
};

export { STOPS as STOP_COORDS };

export const STOP_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STOPS).map(([id, s]) => [id, s.name])
);

// Rough road transit edges (minutes, TZS) — daladala tiers: 700 minimum,
// 800 short-haul, 900–1000 medium, 1200 long; DART flat 650 card fare.
const EDGES: Array<{ from: string; to: string; baseMinutes: number; basePriceTzs: number; label: string }> = [
  // --- CBD & DART trunk (Ilala) ---
  { from: 'morocco', to: 'kariakoo_gerezani', baseMinutes: 12, basePriceTzs: 800, label: 'DART M1' },
  { from: 'kivukoni', to: 'morocco', baseMinutes: 15, basePriceTzs: 800, label: 'DART M4 ferry connector' },
  { from: 'kivukoni', to: 'posta', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Posta' },
  { from: 'posta', to: 'kariakoo_market', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Kariakoo line' },
  { from: 'kariakoo_market', to: 'kariakoo_gerezani', baseMinutes: 5, basePriceTzs: 700, label: 'Kariakoo link' },
  { from: 'kariakoo_market', to: 'muhimbili', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Muhimbili' },
  { from: 'muhimbili', to: 'msimbazi', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Morogoro line' },
  { from: 'kariakoo_gerezani', to: 'msimbazi', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Gerezani' },
  { from: 'msimbazi', to: 'ubungo', baseMinutes: 12, basePriceTzs: 650, label: 'DART M3 Morogoro' },
  { from: 'ubungo', to: 'mzizima', baseMinutes: 16, basePriceTzs: 650, label: 'DART M2' },
  { from: 'msimbazi', to: 'masaki', baseMinutes: 18, basePriceTzs: 900, label: 'Daladala Masaki-CBD' },
  // --- Kawawa Rd corridor (BRT Phase 2): Kariakoo→Kurasini→Mtoni→Chang'ombe→Mbagala→Temeke ---
  { from: 'kariakoo_market', to: 'kurasini', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Kawawa line' },
  { from: 'kurasini', to: 'mtoni', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Mtoni' },
  { from: 'mtoni', to: 'mtoni_mtongani', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Mtongani' },
  { from: 'mtoni', to: 'changombe', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Chang’ombe' },
  { from: 'changombe', to: 'mbagala', baseMinutes: 12, basePriceTzs: 800, label: 'Daladala Mbagala' },
  { from: 'mbagala', to: 'temeke', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Temeke' },
  { from: 'mbagala', to: 'kariakoo_gerezani', baseMinutes: 16, basePriceTzs: 900, label: 'Daladala Chang’ombe express' },
  // --- Nyerere Rd (airport corridor) ---
  { from: 'changombe', to: 'ukonga', baseMinutes: 25, basePriceTzs: 1000, label: 'Daladala Nyerere Rd' },
  // --- Nelson Mandela Rd: Mbagala→Tazara→Mabibo→Ubungo ---
  { from: 'mbagala', to: 'tazara', baseMinutes: 13, basePriceTzs: 900, label: 'Daladala Mandela Rd' },
  { from: 'tazara', to: 'mabibo', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Mabibo' },
  { from: 'mabibo', to: 'ubungo', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Ubungo link' },
  { from: 'tazara', to: 'tabata', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Tazara' },
  { from: 'tazara', to: 'mzizima', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Tazara-Mzizima' },
  // --- Nyerere Rd stages: Kimanga→Ilala Boma→Tabata A→DK→B→Keko→Chang'ombe→Segerea ---
  { from: 'kariakoo_market', to: 'tabata_kimanga', baseMinutes: 14, basePriceTzs: 800, label: 'Daladala Kimanga' },
  { from: 'tabata_kimanga', to: 'tabata', baseMinutes: 12, basePriceTzs: 700, label: 'Daladala Tabata stage' },
  { from: 'tabata_kimanga', to: 'ilala', baseMinutes: 10, basePriceTzs: 700, label: 'Daladala Ilala stage' },
  { from: 'ilala', to: 'tabata_a', baseMinutes: 18, basePriceTzs: 700, label: 'Daladala Tabata A' },
  { from: 'tabata_a', to: 'tabata_dk', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Tabata DK' },
  { from: 'tabata_dk', to: 'tabata_b', baseMinutes: 3, basePriceTzs: 700, label: 'Daladala Tabata B' },
  { from: 'tabata_b', to: 'tabata_keko', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Tabata Keko' },
  { from: 'tabata_keko', to: 'tabata_changombe', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Tabata Chang’ombe' },
  { from: 'tabata_changombe', to: 'changombe', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Chang’ombe link' },
  { from: 'tabata_changombe', to: 'segerea', baseMinutes: 20, basePriceTzs: 900, label: 'Daladala Segerea' },
  { from: 'tabata', to: 'tabata_a', baseMinutes: 3, basePriceTzs: 700, label: 'Daladala Tabata stage' },
  { from: 'ilala', to: 'tabata', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Tabata' },
  { from: 'ilala', to: 'msimbazi', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Ilala' },
  // --- Pugu Rd southern belt (Ilala) ---
  { from: 'buguruni', to: 'gongo', baseMinutes: 18, basePriceTzs: 1000, label: 'Daladala Gongo la Mboto' },
  { from: 'gongo', to: 'ukonga', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Ukonga-Pugu Rd' },
  { from: 'gongo', to: 'chanika', baseMinutes: 7, basePriceTzs: 800, label: 'Gongo–Chanika' },
  { from: 'chanika', to: 'banana', baseMinutes: 6, basePriceTzs: 700, label: 'Chanika–Banana' },
  { from: 'kitunda', to: 'banana', baseMinutes: 8, basePriceTzs: 700, label: 'Daladala Banana line' },
  { from: 'kitunda', to: 'gongo', baseMinutes: 10, basePriceTzs: 700, label: 'Kitunda–Gongo' },
  // --- Real route 18: Buguruni–Yombo Vituka/Viwandani ---
  { from: 'buguruni', to: 'viwandani', baseMinutes: 4, basePriceTzs: 700, label: 'Buguruni–Viwandani' },
  { from: 'banana', to: 'viwandani', baseMinutes: 13, basePriceTzs: 800, label: 'Daladala Viwandani' },
  { from: 'banana', to: 'machimbo', baseMinutes: 9, basePriceTzs: 800, label: 'Daladala Machimbo' },
  { from: 'banana', to: 'mwanagati', baseMinutes: 11, basePriceTzs: 800, label: 'Daladala Mwanagati' },
  { from: 'mwanagati', to: 'kwa_moshi', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Kwa Moshi' },
  { from: 'banana', to: 'kwa_moshi', baseMinutes: 15, basePriceTzs: 900, label: 'Banana–Kwa Moshi express' },
  // --- Mbagala Rangi 3 hub (Temeke) ---
  { from: 'mbagala', to: 'rangi3', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Rangi 3 stage' },
  { from: 'rangi3', to: 'kiburugwa', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Kiburugwa' },
  { from: 'rangi3', to: 'kongowe', baseMinutes: 9, basePriceTzs: 800, label: 'Rangi 3–Kongowe' },
  { from: 'rangi3', to: 'temeke', baseMinutes: 6, basePriceTzs: 700, label: 'Rangi 3–Temeke' },
  { from: 'rangi3', to: 'charambe', baseMinutes: 5, basePriceTzs: 700, label: 'Rangi 3–Charambe' },
  // --- Morogoro Rd corridor (runs WEST from the CBD) ---
  { from: 'msimbazi', to: 'buguruni', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Buguruni' },
  { from: 'buguruni', to: 'mzizima', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Mzizima feeder' },
  { from: 'manzese', to: 'ubungo', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Manzese' },
  { from: 'manzese', to: 'kimara', baseMinutes: 14, basePriceTzs: 900, label: 'Daladala Morogoro express' },
  { from: 'ubungo', to: 'kimara', baseMinutes: 12, basePriceTzs: 800, label: 'Daladala Morogoro' },
  { from: 'kimara', to: 'mbezi_mwisho', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Mbezi Mwisho' },
  { from: 'mbezi_mwisho', to: 'kiluvya', baseMinutes: 18, basePriceTzs: 900, label: 'Daladala Kiluvya' },
  { from: 'kibamba', to: 'kiluvya', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Kibamba' },
  { from: 'mbezi_mwisho', to: 'kibamba', baseMinutes: 14, basePriceTzs: 900, label: 'Mbezi Mwisho–Kibamba' },
  { from: 'kibamba', to: 'goba', baseMinutes: 35, basePriceTzs: 1000, label: 'Kibamba–Goba' },
  // --- Sam Nujoma / Mlimani (Ubungo) ---
  { from: 'mwenge', to: 'mlimani', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Mlimani' },
  { from: 'mlimani', to: 'ubungo', baseMinutes: 7, basePriceTzs: 650, label: 'DART M5 feeder' },
  { from: 'sinza', to: 'mlimani', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Sinza-Mlimani' },
  { from: 'mwenge', to: 'sinza', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Mwenge-Sinza' },
  { from: 'magufuli_terminal', to: 'ubungo', baseMinutes: 28, basePriceTzs: 1200, label: 'Daladala Magufuli Terminal' },
  { from: 'gongo', to: 'mwenge', baseMinutes: 22, basePriceTzs: 1000, label: 'Gongo–Mwenge via Sam Nujoma' },
  // --- Bagamoyo Rd coastal north (Kinondoni) ---
  { from: 'mwenge', to: 'tegeta_mwenge', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Bagamoyo Rd' },
  { from: 'tegeta_mwenge', to: 'bunju', baseMinutes: 15, basePriceTzs: 900, label: 'Daladala Bunju' },
  { from: 'tegeta_mwenge', to: 'mbezi', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Mbezi Beach' },
  { from: 'mbezi', to: 'boko', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Boko line' },
  { from: 'boko', to: 'mbande', baseMinutes: 7, basePriceTzs: 800, label: 'Boko–Mbande' },
  { from: 'mbande', to: 'bunju', baseMinutes: 12, basePriceTzs: 800, label: 'Mbande–Bunju' },
  { from: 'kawe', to: 'mwenge', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Kawe-Mwenge' },
  // --- Msasani peninsula (Kinondoni) ---
  { from: 'msasani', to: 'masaki', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Msasani' },
  { from: 'msasani', to: 'slipway', baseMinutes: 6, basePriceTzs: 700, label: 'Daladala Toure Drive' },
  { from: 'msasani', to: 'mikocheni', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Msasani-Mikocheni' },
  { from: 'kawe', to: 'mikocheni', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Kawe' },
  { from: 'masaki', to: 'mikocheni', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Masaki-Mikocheni' },
  { from: 'masaki', to: 'coco_beach', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Oysterbay' },
  { from: 'masaki', to: 'slipway', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Slipway' },
  { from: 'slipway', to: 'otrong_tire', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Toure Drive' },
  { from: 'otrong_tire', to: 'mlelani', baseMinutes: 12, basePriceTzs: 800, label: 'Daladala Toure Drive' },
  { from: 'mikocheni', to: 'mlelani', baseMinutes: 4, basePriceTzs: 700, label: 'Daladala Mikocheni A' },
  { from: 'mlelani', to: 'damoni', baseMinutes: 5, basePriceTzs: 700, label: 'Daladala Mikocheni' },
  { from: 'damoni', to: 'tegeta_mwenge', baseMinutes: 14, basePriceTzs: 900, label: 'Daladala Tegeta' },
  { from: 'mwenge', to: 'mikocheni', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Mwenge-Mikocheni' },
  { from: 'mikocheni', to: 'sunny_side', baseMinutes: 8, basePriceTzs: 700, label: 'Daladala Sunny Side' },
  // --- Magomeni belt ---
  { from: 'kariakoo_gerezani', to: 'magomeni', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Magomeni' },
  { from: 'magomeni', to: 'morocco', baseMinutes: 8, basePriceTzs: 800, label: 'Daladala Morocco line' },
  { from: 'magomeni', to: 'sunny_side', baseMinutes: 7, basePriceTzs: 700, label: 'Daladala Sunny Side' },
  { from: 'sunny_side', to: 'ubungo', baseMinutes: 14, basePriceTzs: 900, label: 'Daladala Ubungo feeder' },
  { from: 'sunny_side', to: 'sinza', baseMinutes: 10, basePriceTzs: 800, label: 'Daladala Sinza' },
  { from: 'sinza', to: 'kimara', baseMinutes: 12, basePriceTzs: 800, label: 'Daladala Kimara' },
  { from: 'mwenge', to: 'morocco', baseMinutes: 11, basePriceTzs: 800, label: 'Daladala Mwenge-Morocco' },
  { from: 'mwenge', to: 'kariakoo_market', baseMinutes: 16, basePriceTzs: 900, label: 'Daladala Mwenge-Kariakoo' },
  // --- Ferry & Kigamboni ---
  { from: 'kivukoni', to: 'gerezani_terminus', baseMinutes: 6, basePriceTzs: 700, label: 'Kigamboni ferry crossing' },
  { from: 'gerezani_terminus', to: 'kariakoo_gerezani', baseMinutes: 5, basePriceTzs: 700, label: 'Gerezani link daladala' },
  { from: 'gerezani_terminus', to: 'tmj', baseMinutes: 14, basePriceTzs: 800, label: 'Daladala Kigamboni town' },
  { from: 'tmj', to: 'kisiwani', baseMinutes: 14, basePriceTzs: 800, label: 'Daladala Kisiwani' },
  { from: 'kisiwani', to: 'vijibweni', baseMinutes: 2, basePriceTzs: 700, label: 'Kisiwani–Vijibweni' },
  { from: 'tmj', to: 'kibugumo', baseMinutes: 22, basePriceTzs: 1000, label: 'Daladala Kibugumo' },
  { from: 'kibugumo', to: 'gezaulole', baseMinutes: 6, basePriceTzs: 700, label: 'Kibugumo–Gezaulole' },
  { from: 'tmj', to: 'vijibweni', baseMinutes: 15, basePriceTzs: 800, label: 'Kigamboni–Vijibweni' },
  { from: 'vijibweni', to: 'somangila', baseMinutes: 30, basePriceTzs: 1000, label: 'Vijibweni–Somangila' },
  { from: 'kimbiji', to: 'somangila', baseMinutes: 20, basePriceTzs: 900, label: 'Kimbiji–Somangila' },
  { from: 'gezaulole', to: 'somangila', baseMinutes: 22, basePriceTzs: 1000, label: 'Gezaulole–Somangila' },

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

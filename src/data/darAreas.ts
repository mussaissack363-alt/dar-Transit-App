/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gazetted Dar es Salaam areas organized by the five municipalities
 * (Ilala, Kinondoni, Ubungo, Temeke, Kigamboni — reorganized 2015/16),
 * with ward assignments following the 2022 census. Coordinates are
 * approximate ward centroids — good enough for map lookup and for
 * finding the nearest transit stop.
 */
export type DarDistrict =
  | 'Ilala'
  | 'Kinondoni'
  | 'Ubungo'
  | 'Temeke'
  | 'Kigamboni'
  | 'Landmark';

export interface DarArea {
  name: string;
  district: DarDistrict;
  lat: number;
  long: number;
}

export const DAR_AREAS: DarArea[] = [
  // ─── Ilala Municipal (1.65M, seat Mchafukoge) — CBD + southern belt ───
  { name: 'Mchafukoge (CBD)', district: 'Ilala', lat: -6.8231, long: 39.2827 },
  { name: 'Kivukoni', district: 'Ilala', lat: -6.8200, long: 39.2985 },
  { name: 'Kariakoo', district: 'Ilala', lat: -6.8200, long: 39.2730 },
  { name: 'Gerezani', district: 'Ilala', lat: -6.8256, long: 39.2734 },
  { name: 'Kisutu', district: 'Ilala', lat: -6.8200, long: 39.2730 },
  { name: 'Ilala Boma', district: 'Ilala', lat: -6.8270, long: 39.2645 },
  { name: 'Jangwani', district: 'Ilala', lat: -6.8110, long: 39.2680 },
  { name: 'Mchikichini', district: 'Ilala', lat: -6.8227, long: 39.2672 },
  { name: 'Mnyamani', district: 'Ilala', lat: -6.8391, long: 39.2385 },
  { name: 'Kimanga (Tabata Kimanga)', district: 'Ilala', lat: -6.8239, long: 39.1964 },
  { name: 'Tabata A', district: 'Ilala', lat: -6.8286, long: 39.2313 },
  { name: 'Tabata B', district: 'Ilala', lat: -6.8255, long: 39.2450 },
  { name: 'Tabata Keko', district: 'Ilala', lat: -6.8240, long: 39.2520 },
  { name: 'Tabata DK (Duka Kuu)', district: 'Ilala', lat: -6.8270, long: 39.2380 },
  { name: 'Upanga Mashariki', district: 'Ilala', lat: -6.8067, long: 39.2813 },
  { name: 'Upanga Magharibi', district: 'Ilala', lat: -6.8034, long: 39.2737 },
  { name: 'Buguruni', district: 'Ilala', lat: -6.8384, long: 39.2436 },
  { name: 'Vingunguti', district: 'Ilala', lat: -6.8455, long: 39.2251 },
  { name: 'Gongo la Mboto', district: 'Ilala', lat: -6.8820, long: 39.1568 },
  { name: 'Kiwalani', district: 'Ilala', lat: -6.8620, long: 39.2286 },
  { name: 'Kinyerezi', district: 'Ilala', lat: -6.8517, long: 39.1596 },
  { name: 'Majohe', district: 'Ilala', lat: -6.8271, long: 39.2018 },
  { name: 'Zingiziwa', district: 'Ilala', lat: -6.8400, long: 39.2600 },
  { name: 'Kitunda', district: 'Ilala', lat: -6.8978, long: 39.1956 },
  { name: 'Kipunguni', district: 'Ilala', lat: -6.8900, long: 39.1700 },
  { name: 'Segerea (Tabata Segerea)', district: 'Ilala', lat: -6.8437, long: 39.2014 },
  { name: 'Segerea B', district: 'Ilala', lat: -6.8460, long: 39.1980 },
  { name: 'Ukonga', district: 'Ilala', lat: -6.8764, long: 39.1714 },
  { name: 'Kipawa (Airport belt)', district: 'Ilala', lat: -6.8661, long: 39.1965 },
  { name: 'Msongola', district: 'Ilala', lat: -6.9722, long: 39.1759 },
  { name: 'Kivule', district: 'Ilala', lat: -6.9333, long: 39.1837 },
  { name: 'Buyuni', district: 'Ilala', lat: -6.9100, long: 39.1800 },
  { name: 'Chanika', district: 'Ilala', lat: -6.8900, long: 39.1800 },
  { name: 'Bonyokwa', district: 'Ilala', lat: -6.8273, long: 39.1668 },
  { name: 'Pugu', district: 'Ilala', lat: -6.8820, long: 39.1568 },
  { name: 'Pugu Station', district: 'Ilala', lat: -6.8746, long: 39.1236 },
  { name: 'Mzinga', district: 'Ilala', lat: -6.9100, long: 39.2065 },
  { name: 'Minazi Mirefu', district: 'Ilala', lat: -6.8800, long: 39.2100 },
  { name: 'Liwiti', district: 'Ilala', lat: -6.8390, long: 39.2107 },
  { name: 'Kisukuru', district: 'Ilala', lat: -6.8241, long: 39.1820 },
  { name: 'Banana (Kitunda hub)', district: 'Ilala', lat: -6.8714, long: 39.1894 },
  { name: 'Mwanagati', district: 'Ilala', lat: -6.9125, long: 39.2138 },
  { name: 'Kwa Moshi', district: 'Ilala', lat: -6.9250, long: 39.2250 },
  { name: 'Machimbo', district: 'Ilala', lat: -6.9036, long: 39.1838 },
  { name: 'Viwandani (Yombo)', district: 'Ilala', lat: -6.8499, long: 39.2453 },
  { name: 'Kibeberu', district: 'Ilala', lat: -6.9206, long: 39.2037 },

  // ─── Kinondoni Municipal (982k, seat Ndugumbi) — coastal north ───
  { name: 'Magomeni', district: 'Kinondoni', lat: -6.8058, long: 39.2584 },
  { name: 'Ndugumbi', district: 'Kinondoni', lat: -6.8022, long: 39.2468 },
  { name: 'Hananasif', district: 'Kinondoni', lat: -6.7973, long: 39.2719 },
  { name: 'Mzimuni', district: 'Kinondoni', lat: -6.8068, long: 39.2540 },
  { name: 'Mwananyamala', district: 'Kinondoni', lat: -6.7900, long: 39.2558 },
  { name: 'Kijitonyama', district: 'Kinondoni', lat: -6.7767, long: 39.2434 },
  { name: 'Kigogo', district: 'Kinondoni', lat: -6.8187, long: 39.2449 },
  { name: 'Makongo', district: 'Kinondoni', lat: -6.7560, long: 39.2018 },
  { name: 'Kinondoni (Mbezi Luis road)', district: 'Kinondoni', lat: -6.7841, long: 39.2716 },
  { name: 'Tandale', district: 'Kinondoni', lat: -6.7952, long: 39.2409 },
  { name: 'Makumbusho', district: 'Kinondoni', lat: -6.7776, long: 39.2465 },
  { name: 'Mikocheni', district: 'Kinondoni', lat: -6.7490, long: 39.2450 },
  { name: 'Mlalakuwa', district: 'Kinondoni', lat: -6.7700, long: 39.2300 },
  { name: 'Msasani', district: 'Kinondoni', lat: -6.7489, long: 39.2814 },
  { name: 'Oysterbay', district: 'Kinondoni', lat: -6.7220, long: 39.2930 },
  { name: 'Kawe', district: 'Kinondoni', lat: -6.7382, long: 39.2295 },
  { name: 'Kawe Mwisho', district: 'Kinondoni', lat: -6.7300, long: 39.2220 },
  { name: 'Kunduchi', district: 'Kinondoni', lat: -6.6729, long: 39.2064 },
  { name: 'Bunju', district: 'Kinondoni', lat: -6.6800, long: 39.1570 },
  { name: 'Wazo (Ununio road)', district: 'Kinondoni', lat: -6.7050, long: 39.1800 },
  { name: 'Ununio', district: 'Kinondoni', lat: -6.7000, long: 39.1900 },
  { name: 'Mabwepande', district: 'Kinondoni', lat: -6.7200, long: 39.1700 },
  { name: 'Mbezi Juu', district: 'Kinondoni', lat: -6.7248, long: 39.2021 },
  { name: 'Mbweni', district: 'Kinondoni', lat: -6.8215, long: 39.2660 },
  { name: 'Boko', district: 'Kinondoni', lat: -6.7160, long: 39.2060 },
  { name: 'Mbande', district: 'Kinondoni', lat: -6.7060, long: 39.1990 },
  { name: 'Kibamba', district: 'Kinondoni', lat: -6.7750, long: 39.0600 },
  { name: 'Bunju A', district: 'Kinondoni', lat: -6.6800, long: 39.1570 },
  { name: 'Bunju B', district: 'Kinondoni', lat: -6.6800, long: 39.1570 },
  { name: 'Mabwepande Kwa Ndege', district: 'Kinondoni', lat: -6.7230, long: 39.1680 },

  // ─── Ubungo Municipal (1.09M, seat Kwembe) — the crossroads ───
  { name: 'Ubungo (interchange)', district: 'Ubungo', lat: -6.7936, long: 39.2097 },
  { name: 'Sinza', district: 'Ubungo', lat: -6.7778, long: 39.2287 },
  { name: 'Manzese', district: 'Ubungo', lat: -6.7971, long: 39.2337 },
  { name: 'Kimara', district: 'Ubungo', lat: -6.7960, long: 39.1807 },
  { name: 'Kibangu', district: 'Ubungo', lat: -6.8100, long: 39.2350 },
  { name: 'Kilimani', district: 'Ubungo', lat: -6.7957, long: 39.2279 },
  { name: 'Kwembe', district: 'Ubungo', lat: -6.7800, long: 39.1900 },
  { name: 'Goba', district: 'Ubungo', lat: -6.7404, long: 39.1612 },
  { name: 'Mlimani', district: 'Ubungo', lat: -6.7714, long: 39.2210 },
  { name: 'Mburahati', district: 'Ubungo', lat: -6.8000, long: 39.2400 },
  { name: 'Kiluvya', district: 'Ubungo', lat: -6.7900, long: 39.0780 },
  { name: 'Goba Kwa Jombe', district: 'Ubungo', lat: -6.7404, long: 39.1612 },
  { name: 'Mbezi Mwisho (Njia Panda)', district: 'Ubungo', lat: -6.7869, long: 39.1660 },

  // ─── Temeke Municipal (1.35M, seat Miburani) — industrial south ───
  { name: 'Kurasini', district: 'Temeke', lat: -6.8305, long: 39.2861 },
  { name: 'Mtoni', district: 'Temeke', lat: -6.8420, long: 39.2800 },
  { name: 'Keko', district: 'Temeke', lat: -6.8379, long: 39.2749 },
  { name: "Chang'ombe", district: 'Temeke', lat: -6.796, long: 39.266 },
  { name: "Tabata Chang'ombe", district: 'Temeke', lat: -6.797, long: 39.27 },
  { name: "Chang'ombe Dogo", district: 'Temeke', lat: -6.793, long: 39.273 },
  { name: 'Charambe', district: 'Temeke', lat: -6.9196, long: 39.2566 },
  { name: 'Miburani', district: 'Temeke', lat: -6.8560, long: 39.2757 },
  { name: 'Mbagala', district: 'Temeke', lat: -6.8999, long: 39.2660 },
  { name: 'Mbagala Kuu', district: 'Temeke', lat: -6.8999, long: 39.2660 },
  { name: 'Mbagala Rangi Tatu', district: 'Temeke', lat: -6.9174, long: 39.2703 },
  { name: 'Kilakala', district: 'Temeke', lat: -6.8692, long: 39.2433 },
  { name: 'Kijichi', district: 'Temeke', lat: -6.8860, long: 39.2915 },
  { name: 'Yombo', district: 'Temeke', lat: -6.8790, long: 39.2485 },
  { name: 'Vituka', district: 'Temeke', lat: -6.8600, long: 39.2400 },
  { name: 'Buza', district: 'Temeke', lat: -6.8923, long: 39.2259 },
  { name: 'Azimio', district: 'Temeke', lat: -6.8705, long: 39.2648 },
  { name: 'Temeke Mjini', district: 'Temeke', lat: -6.9020, long: 39.2770 },
  { name: 'Kizinga', district: 'Temeke', lat: -6.8929, long: 39.2637 },
  { name: 'Saranga', district: 'Temeke', lat: -6.7965, long: 39.1508 },
  { name: 'Vikindi', district: 'Temeke', lat: -6.9100, long: 39.2900 },
  { name: 'Sandali', district: 'Temeke', lat: -6.8554, long: 39.2466 },
  { name: 'Kulangwa', district: 'Temeke', lat: -6.7101, long: 39.1350 },
  { name: 'Majani ya Gani', district: 'Temeke', lat: -6.9200, long: 39.2700 },
  { name: 'Mbagala Rangi Tatu (Rangi 3)', district: 'Temeke', lat: -6.9174, long: 39.2703 },
  { name: 'Mtoni Mtongani', district: 'Temeke', lat: -6.8520, long: 39.2700 },
  { name: 'Kiburugwa', district: 'Temeke', lat: -6.9048, long: 39.2510 },
  { name: 'Charambe Kwa Wazee', district: 'Temeke', lat: -6.9250, long: 39.2600 },

  // ─── Kigamboni Municipal (318k, seat Somangila) — 9 wards ───
  { name: 'Kigamboni (town)', district: 'Kigamboni', lat: -6.8255, long: 39.3094 },
  { name: 'Mjimwema', district: 'Kigamboni', lat: -6.8704, long: 39.2559 },
  { name: 'Tandika', district: 'Kigamboni', lat: -6.8704, long: 39.2559 },
  { name: 'Kibada', district: 'Kigamboni', lat: -6.8920, long: 39.3392 },
  { name: 'Tungi', district: 'Kigamboni', lat: -6.8343, long: 39.3223 },
  { name: 'Vijibweni', district: 'Kigamboni', lat: -6.8617, long: 39.3199 },
  { name: 'Kimbiji', district: 'Kigamboni', lat: -6.9894, long: 39.5289 },
  { name: 'Pemba Mnazi', district: 'Kigamboni', lat: -7.0972, long: 39.4362 },
  { name: 'Somangila', district: 'Kigamboni', lat: -6.8952, long: 39.4797 },
  { name: 'Kibugumo', district: 'Kigamboni', lat: -6.8675, long: 39.3674 },
  { name: 'Gezaulole', district: 'Kigamboni', lat: -6.8850, long: 39.3750 },
  { name: 'Kisiwani', district: 'Kigamboni', lat: -6.8635, long: 39.3222 },
  { name: 'Ungindoni', district: 'Kigamboni', lat: -6.8629, long: 39.3537 },
  { name: 'Mbutu Kichangani', district: 'Kigamboni', lat: -6.8900, long: 39.3500 },
  { name: 'Kongowe', district: 'Kigamboni', lat: -6.9543, long: 39.2832 },

  // ─── Landmarks ───
  { name: 'Magufuli Bus Terminal', district: 'Landmark', lat: -6.7846, long: 39.1088 },
  { name: 'Julius Nyerere Int. Airport (T1/T2)', district: 'Landmark', lat: -6.8781, long: 39.2028 },
  { name: 'Julius Nyerere Int. Airport (T3)', district: 'Landmark', lat: -6.8785, long: 39.2040 },
  { name: 'University of Dar es Salaam', district: 'Landmark', lat: -6.7806, long: 39.2033 },
  { name: 'Mlimani City Mall', district: 'Landmark', lat: -6.7714, long: 39.2210 },
  { name: 'Muhimbili National Hospital', district: 'Landmark', lat: -6.8077, long: 39.2722 },
  { name: 'Muhimbili Orthopaedic Institute (MOI)', district: 'Landmark', lat: -6.8080, long: 39.2740 },
  { name: 'Aga Khan Hospital', district: 'Landmark', lat: -6.7809, long: 39.2467 },
  { name: 'National Stadium (Miburani)', district: 'Landmark', lat: -6.8378, long: 39.2700 },
  { name: 'Port of Dar es Salaam', district: 'Landmark', lat: -6.8250, long: 39.2920 },
  { name: 'TANESCO Headquarters', district: 'Landmark', lat: -6.8170, long: 39.2870 },
  { name: 'National Museum', district: 'Landmark', lat: -6.8160, long: 39.2900 },
  { name: 'Azania Front Lutheran Church', district: 'Landmark', lat: -6.8180, long: 39.2930 },
  { name: 'Askari Monument (CBD)', district: 'Landmark', lat: -6.8155, long: 39.2890 },
  { name: 'Mnazi Mmoja Grounds', district: 'Landmark', lat: -6.8180, long: 39.2820 },
  { name: 'Nyerere Bridge (Kigamboni)', district: 'Landmark', lat: -6.8200, long: 39.3000 },
  { name: 'Tanzanite Bridge (Msasani–Kivukoni)', district: 'Landmark', lat: -6.7919, long: 39.2853 },
  { name: 'Msimbazi / Jangwani Bridge', district: 'Landmark', lat: -6.8110, long: 39.2680 },
  { name: 'Coco Beach (Oysterbay)', district: 'Landmark', lat: -6.7220, long: 39.2930 },
  { name: 'Slipway Waterfront', district: 'Landmark', lat: -6.7247, long: 39.2863 },
  { name: 'Kunduchi Beach & Ruins', district: 'Landmark', lat: -6.6650, long: 39.2100 },
  { name: 'Makumbusho Village Museum', district: 'Landmark', lat: -6.7570, long: 39.2350 },
  { name: 'Pugu Hills Forest Reserve', district: 'Landmark', lat: -6.8850, long: 39.1300 },
  { name: 'Pande Game Reserve', district: 'Landmark', lat: -6.7900, long: 39.1500 },
];

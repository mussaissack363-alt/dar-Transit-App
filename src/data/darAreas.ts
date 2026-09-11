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
  { name: 'Mchafukoge (CBD)', district: 'Ilala', lat: -6.7715, long: 39.226 },
  { name: 'Kivukoni', district: 'Ilala', lat: -6.776, long: 39.218 },
  { name: 'Kariakoo', district: 'Ilala', lat: -6.768, long: 39.266 },
  { name: 'Gerezani', district: 'Ilala', lat: -6.764, long: 39.256 },
  { name: 'Kisutu', district: 'Ilala', lat: -6.77, long: 39.268 },
  { name: 'Ilala Boma', district: 'Ilala', lat: -6.786, long: 39.274 },
  { name: 'Jangwani', district: 'Ilala', lat: -6.774, long: 39.281 },
  { name: 'Mchikichini', district: 'Ilala', lat: -6.783, long: 39.269 },
  { name: 'Mnyamani', district: 'Ilala', lat: -6.78, long: 39.267 },
  { name: 'Kimanga (Tabata Kimanga)', district: 'Ilala', lat: -6.784, long: 39.265 },
  { name: 'Tabata A', district: 'Ilala', lat: -6.791, long: 39.264 },
  { name: 'Tabata B', district: 'Ilala', lat: -6.793, long: 39.27 },
  { name: 'Tabata Keko', district: 'Ilala', lat: -6.79, long: 39.275 },
  { name: 'Tabata DK (Duka Kuu)', district: 'Ilala', lat: -6.794, long: 39.266 },
  { name: 'Upanga Mashariki', district: 'Ilala', lat: -6.772, long: 39.276 },
  { name: 'Upanga Magharibi', district: 'Ilala', lat: -6.77, long: 39.268 },
  { name: 'Buguruni', district: 'Ilala', lat: -6.78, long: 39.293 },
  { name: 'Vingunguti', district: 'Ilala', lat: -6.795, long: 39.295 },
  { name: 'Gongo la Mboto', district: 'Ilala', lat: -6.795, long: 39.317 },
  { name: 'Kiwalani', district: 'Ilala', lat: -6.802, long: 39.275 },
  { name: 'Kinyerezi', district: 'Ilala', lat: -6.805, long: 39.262 },
  { name: 'Majohe', district: 'Ilala', lat: -6.807, long: 39.27 },
  { name: 'Zingiziwa', district: 'Ilala', lat: -6.809, long: 39.287 },
  { name: 'Kitunda', district: 'Ilala', lat: -6.817, long: 39.293 },
  { name: 'Kipunguni', district: 'Ilala', lat: -6.821, long: 39.279 },
  { name: 'Segerea (Tabata Segerea)', district: 'Ilala', lat: -6.815, long: 39.265 },
  { name: 'Segerea B', district: 'Ilala', lat: -6.819, long: 39.261 },
  { name: 'Ukonga', district: 'Ilala', lat: -6.83, long: 39.28 },
  { name: 'Kipawa (Airport belt)', district: 'Ilala', lat: -6.855, long: 39.228 },
  { name: 'Msongola', district: 'Ilala', lat: -6.838, long: 39.3 },
  { name: 'Kivule', district: 'Ilala', lat: -6.84, long: 39.272 },
  { name: 'Buyuni', district: 'Ilala', lat: -6.85, long: 39.29 },
  { name: 'Chanika', district: 'Ilala', lat: -6.813, long: 39.29 },
  { name: 'Bonyokwa', district: 'Ilala', lat: -6.825, long: 39.262 },
  { name: 'Pugu', district: 'Ilala', lat: -6.865, long: 39.26 },
  { name: 'Pugu Station', district: 'Ilala', lat: -6.868, long: 39.245 },
  { name: 'Mzinga', district: 'Ilala', lat: -6.802, long: 39.268 },
  { name: 'Minazi Mirefu', district: 'Ilala', lat: -6.799, long: 39.282 },
  { name: 'Liwiti', district: 'Ilala', lat: -6.798, long: 39.272 },
  { name: 'Kisukuru', district: 'Ilala', lat: -6.812, long: 39.274 },

  // ─── Kinondoni Municipal (982k, seat Ndugumbi) — coastal north ───
  { name: 'Magomeni', district: 'Kinondoni', lat: -6.786, long: 39.256 },
  { name: 'Ndugumbi', district: 'Kinondoni', lat: -6.772, long: 39.26 },
  { name: 'Hananasif', district: 'Kinondoni', lat: -6.77, long: 39.256 },
  { name: 'Mzimuni', district: 'Kinondoni', lat: -6.778, long: 39.27 },
  { name: 'Mwananyamala', district: 'Kinondoni', lat: -6.776, long: 39.283 },
  { name: 'Kijitonyama', district: 'Kinondoni', lat: -6.774, long: 39.289 },
  { name: 'Kigogo', district: 'Kinondoni', lat: -6.777, long: 39.286 },
  { name: 'Makongo', district: 'Kinondoni', lat: -6.768, long: 39.305 },
  { name: 'Kinondoni (Mbezi Luis road)', district: 'Kinondoni', lat: -6.787, long: 39.244 },
  { name: 'Tandale', district: 'Kinondoni', lat: -6.766, long: 39.264 },
  { name: 'Makumbusho', district: 'Kinondoni', lat: -6.762, long: 39.278 },
  { name: 'Mikocheni', district: 'Kinondoni', lat: -6.754, long: 39.283 },
  { name: 'Mlalakuwa', district: 'Kinondoni', lat: -6.748, long: 39.289 },
  { name: 'Msasani', district: 'Kinondoni', lat: -6.733, long: 39.298 },
  { name: 'Oysterbay', district: 'Kinondoni', lat: -6.722, long: 39.302 },
  { name: 'Kawe', district: 'Kinondoni', lat: -6.757, long: 39.315 },
  { name: 'Kawe Mwisho', district: 'Kinondoni', lat: -6.754, long: 39.322 },
  { name: 'Kunduchi', district: 'Kinondoni', lat: -6.756, long: 39.33 },
  { name: 'Bunju', district: 'Kinondoni', lat: -6.741, long: 39.348 },
  { name: 'Wazo (Ununio road)', district: 'Kinondoni', lat: -6.747, long: 39.33 },
  { name: 'Ununio', district: 'Kinondoni', lat: -6.742, long: 39.336 },
  { name: 'Mabwepande', district: 'Kinondoni', lat: -6.73, long: 39.35 },
  { name: 'Mbezi Juu', district: 'Kinondoni', lat: -6.759, long: 39.34 },
  { name: 'Mbweni', district: 'Kinondoni', lat: -6.775, long: 39.248 },

  // ─── Ubungo Municipal (1.09M, seat Kwembe) — the crossroads ───
  { name: 'Ubungo (interchange)', district: 'Ubungo', lat: -6.7845, long: 39.2965 },
  { name: 'Sinza', district: 'Ubungo', lat: -6.78, long: 39.31 },
  { name: 'Manzese', district: 'Ubungo', lat: -6.777, long: 39.319 },
  { name: 'Kimara', district: 'Ubungo', lat: -6.769, long: 39.343 },
  { name: 'Kibangu', district: 'Ubungo', lat: -6.789, long: 39.302 },
  { name: 'Kilimani', district: 'Ubungo', lat: -6.791, long: 39.309 },
  { name: 'Kwembe', district: 'Ubungo', lat: -6.776, long: 39.355 },
  { name: 'Goba', district: 'Ubungo', lat: -6.765, long: 39.37 },
  { name: 'Mlimani', district: 'Ubungo', lat: -6.769, long: 39.287 },
  { name: 'Mburahati', district: 'Ubungo', lat: -6.772, long: 39.29 },

  // ─── Temeke Municipal (1.35M, seat Miburani) — industrial south ───
  { name: 'Kurasini', district: 'Temeke', lat: -6.795, long: 39.26 },
  { name: 'Mtoni', district: 'Temeke', lat: -6.794, long: 39.272 },
  { name: 'Keko', district: 'Temeke', lat: -6.792, long: 39.272 },
  { name: "Chang'ombe", district: 'Temeke', lat: -6.796, long: 39.266 },
  { name: "Tabata Chang'ombe", district: 'Temeke', lat: -6.797, long: 39.27 },
  { name: "Chang'ombe Dogo", district: 'Temeke', lat: -6.793, long: 39.273 },
  { name: 'Charambe', district: 'Temeke', lat: -6.8, long: 39.27 },
  { name: 'Miburani', district: 'Temeke', lat: -6.806, long: 39.28 },
  { name: 'Mbagala', district: 'Temeke', lat: -6.801, long: 39.282 },
  { name: 'Mbagala Kuu', district: 'Temeke', lat: -6.804, long: 39.286 },
  { name: 'Mbagala Rangi Tatu', district: 'Temeke', lat: -6.806, long: 39.288 },
  { name: 'Kilakala', district: 'Temeke', lat: -6.81, long: 39.295 },
  { name: 'Kijichi', district: 'Temeke', lat: -6.808, long: 39.268 },
  { name: 'Yombo', district: 'Temeke', lat: -6.818, long: 39.297 },
  { name: 'Vituka', district: 'Temeke', lat: -6.826, long: 39.307 },
  { name: 'Buza', district: 'Temeke', lat: -6.806, long: 39.3 },
  { name: 'Azimio', district: 'Temeke', lat: -6.808, long: 39.279 },
  { name: 'Temeke Mjini', district: 'Temeke', lat: -6.816, long: 39.284 },
  { name: 'Kizinga', district: 'Temeke', lat: -6.812, long: 39.262 },
  { name: 'Saranga', district: 'Temeke', lat: -6.82, long: 39.275 },
  { name: 'Vikindi', district: 'Temeke', lat: -6.83, long: 39.268 },
  { name: 'Sandali', district: 'Temeke', lat: -6.835, long: 39.276 },
  { name: 'Kulangwa', district: 'Temeke', lat: -6.842, long: 39.262 },
  { name: 'Majani ya Gani', district: 'Temeke', lat: -6.826, long: 39.282 },

  // ─── Kigamboni Municipal (318k, seat Somangila) — 9 wards ───
  { name: 'Kigamboni (town)', district: 'Kigamboni', lat: -6.812, long: 39.243 },
  { name: 'Mjimwema', district: 'Kigamboni', lat: -6.807, long: 39.244 },
  { name: 'Tandika', district: 'Kigamboni', lat: -6.809, long: 39.238 },
  { name: 'Kibada', district: 'Kigamboni', lat: -6.822, long: 39.25 },
  { name: 'Tungi', district: 'Kigamboni', lat: -6.83, long: 39.245 },
  { name: 'Vijibweni', district: 'Kigamboni', lat: -6.845, long: 39.247 },
  { name: 'Kimbiji', district: 'Kigamboni', lat: -6.855, long: 39.262 },
  { name: 'Pemba Mnazi', district: 'Kigamboni', lat: -6.865, long: 39.24 },
  { name: 'Somangila', district: 'Kigamboni', lat: -6.88, long: 39.27 },

  // ─── Landmarks ───
  { name: 'Magufuli Bus Terminal', district: 'Landmark', lat: -6.787, long: 39.299 },
  { name: 'Julius Nyerere Int. Airport (T1/T2)', district: 'Landmark', lat: -6.878, long: 39.203 },
  { name: 'Julius Nyerere Int. Airport (T3)', district: 'Landmark', lat: -6.883, long: 39.196 },
  { name: 'University of Dar es Salaam', district: 'Landmark', lat: -6.767, long: 39.287 },
  { name: 'Mlimani City Mall', district: 'Landmark', lat: -6.769, long: 39.279 },
  { name: 'Muhimbili National Hospital', district: 'Landmark', lat: -6.772, long: 39.273 },
  { name: 'Muhimbili Orthopaedic Institute (MOI)', district: 'Landmark', lat: -6.774, long: 39.276 },
  { name: 'Aga Khan Hospital', district: 'Landmark', lat: -6.779, long: 39.28 },
  { name: 'National Stadium (Miburani)', district: 'Landmark', lat: -6.8, long: 39.283 },
  { name: 'Port of Dar es Salaam', district: 'Landmark', lat: -6.792, long: 39.262 },
  { name: 'TANESCO Headquarters', district: 'Landmark', lat: -6.778, long: 39.282 },
  { name: 'National Museum', district: 'Landmark', lat: -6.774, long: 39.227 },
  { name: 'Azania Front Lutheran Church', district: 'Landmark', lat: -6.774, long: 39.226 },
  { name: 'Askari Monument (CBD)', district: 'Landmark', lat: -6.77, long: 39.229 },
  { name: 'Mnazi Mmoja Grounds', district: 'Landmark', lat: -6.772, long: 39.234 },
  { name: 'Nyerere Bridge (Kigamboni)', district: 'Landmark', lat: -6.799, long: 39.247 },
  { name: 'Tanzanite Bridge (Msasani–Kivukoni)', district: 'Landmark', lat: -6.781, long: 39.23 },
  { name: 'Msimbazi / Jangwani Bridge', district: 'Landmark', lat: -6.776, long: 39.279 },
  { name: 'Coco Beach (Oysterbay)', district: 'Landmark', lat: -6.72, long: 39.306 },
  { name: 'Slipway Waterfront', district: 'Landmark', lat: -6.707, long: 39.293 },
  { name: 'Kunduchi Beach & Ruins', district: 'Landmark', lat: -6.756, long: 39.329 },
  { name: 'Makumbusho Village Museum', district: 'Landmark', lat: -6.762, long: 39.279 },
  { name: 'Pugu Hills Forest Reserve', district: 'Landmark', lat: -6.87, long: 39.23 },
  { name: 'Pande Game Reserve', district: 'Landmark', lat: -6.745, long: 39.38 },
];

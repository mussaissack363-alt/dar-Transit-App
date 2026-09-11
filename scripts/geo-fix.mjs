/**
 * Fixes hand-estimated coordinates by matching stop/area names against:
 *  1. OpenStreetMap (Overpass API) — bus stops, terminals, places, wards  [primary]
 *  2. Wikipedia article coordinates                                       [secondary]
 * Outputs:
 *  /tmp/coords-report.txt    — human-readable comparison table
 *  /tmp/coords-proposal.json — matched coords keyed for the apply script
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const OVERPASS = 'https://overpass-api.de/api/interpreter';
const CACHE = '/tmp/dar-osm.json';
const BBOX = '-7.10,39.10,-6.50,39.80'; // south,west,north,east — all Dar incl. Kigamboni + Pugu

// ---------- helpers ----------
const norm = (s) =>
  s.toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(st|street)\b/g, ' ')
    .replace(/\s+/g, ' ').trim();

const distKm = (aLat, aLon, bLat, bLon) => {
  const R = 6371, dLat = (bLat - aLat) * Math.PI / 180, dLon = (bLon - aLon) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const fmt = (n) => (n < 0 ? '' : '+') + n.toFixed(4);

// per-stop extra aliases (OSM names often differ from our display names)
const ALIASES = {
  morocco: ['Morocco', 'Morocco DART Terminal'],
  kivukoni: ['Kivukoni', 'Kivukoni Ferry Terminal', 'Azania Front'],
  mzizima: ['Mzizima', 'Mzizima Fish Market'],
  tegeta_mwenge: ['Mwenge', 'Mwenge Woodcarvers', 'Tegeta'],
  tmj: ['Tandika', 'Mjimwema'],
  banana: ['Banana', 'Kitunda'],
  rangi3: ['Mbagala Rangi Tatu', 'Rangi Tatu', 'Mbagala Rangi 3'],
  kwa_moshi: ['Kwa Moshi', 'Kwa Mushi'],
  tabata_dk: ['Tabata DK', 'Tabata Duka Kuu'],
  mbezi_mwisho: ['Mbezi Mwisho', 'Njia Panda'],
  mlimani: ['Mlimani', 'University of Dar es Salaam'],
  posta: ['Posta', 'Posta Mpya', 'Askari Monument', 'Sokoine Drive'],
  msimbazi: ['Msimbazi', 'Jangwani'],
  sunny_side: ['Sunny Side'],
  damoni: ['Damoni'],
  mlelani: ['Mlelani'],
  magufuli_terminal: ['Magufuli Bus Terminal', 'Magufuli Terminal'],
  mbagala: ['Mbagala'],
  kariakoo_market: ['Kariakoo', 'Kariakoo Market'],
  kariakoo_gerezani: ['Gerezani', 'Kariakoo Gerezani'],
  gerezani_terminus: ['Gerezani'],
  kurasini: ['Kurasini'],
  viwandani: ['Viwandani', 'Yombo Vituka'],
  ukonga: ['Ukonga'],
  bunju: ['Bunju'],
  goba: ['Goba'],
  kawe: ['Kawe'],
  kimbiji: ['Kimbiji'],
  somangila: ['Somangila'],
  kisiwani: ['Kisiwani'],
  gezaulole: ['Gezaulole'],
  kibugumo: ['Kibugumo'],
  vijibweni: ['Vijibweni'],
  kongowe: ['Kongowe'],
  charambe: ['Charambe'],
  kiburugwa: ['Kiburugwa'],
  mtoni_mtongani: ['Mtoni Mtongani', 'Mtongani'],
  machimbo: ['Machimbo'],
  mwanagati: ['Mwanagati'],
  kitunda: ['Kitunda'],
  chanika: ['Chanika'],
  gongo: ['Gongo la Mboto', 'Gongo'],
  mabibo: ['Mabibo'],
  buguruni: ['Buguruni'],
  ilala: ['Ilala Boma', 'Ilala'],
  manzese: ['Manzese'],
  msasani: ['Msasani', 'Msasani Peninsula'],
  slipway: ['Slipway'],
  coco_beach: ['Coco Beach', 'Oysterbay'],
  boko: ['Boko'],
  mbande: ['Mbande'],
  kibamba: ['Kibamba'],
  kiluvya: ['Kiluvya'],
  kimara: ['Kimara'],
  sinza: ['Sinza'],
  magomeni: ['Magomeni'],
  mikocheni: ['Mikocheni'],
  masaki: ['Masaki'],
  mtoni: ['Mtoni'],
  temeke: ['Temeke'],
  segerea: ['Segerea'],
  tabata: ['Tabata'],
  tazara: ['Tazara', 'TAZARA Railway'],
  muhimbili: ['Muhimbili'],
  kariakoo_extra: [],
  mbezi: ['Mbezi Beach', 'Mbezi'],
  mwenge: ['Mwenge'],
  ubungo: ['Ubungo'],
};

// ---------- 1. Overpass dump ----------
async function fetchOverpass() {
  if (existsSync(CACHE)) return JSON.parse(readFileSync(CACHE, 'utf8'));
  const q = `[out:json][timeout:180];
(
  node["name"]["place"~"^(village|town|suburb|neighbourhood|quarter|hamlet|isolated_dwelling)$"](${BBOX});
  node["name"]["highway"="bus_stop"](${BBOX});
  node["name"]["amenity"~"^(bus_station|bus_terminal)$"](${BBOX});
  node["name"]["railway"~"^(station|halt)$"](${BBOX});
  way["name"]["place"~"^(village|town|suburb|neighbourhood|quarter|hamlet)$"](${BBOX});
  way["name"]["amenity"~"^(bus_station|bus_terminal)$"](${BBOX});
  relation["name"]["boundary"="administrative"]["admin_level"="8"](${BBOX});
  relation["name"]["place"](${BBOX});
);
out 80000 center;`;
  console.error('Querying Overpass…');
  // GET (this environment mangles POST bodies to the interpreter)
  const url = OVERPASS + '?data=' + encodeURIComponent(q);
  const res = await fetch(url, { headers: { 'User-Agent': 'dar-transit-dev/1.0' } });
  if (!res.ok) throw new Error('Overpass HTTP ' + res.status);
  const j = await res.json();
  writeFileSync(CACHE, JSON.stringify(j));
  console.error(`  ${j.elements?.length ?? 0} OSM features cached`);
  return j;
}

// ---------- 2. Wikipedia coords ----------
async function fetchWikiCoords(titles) {
  const out = {};
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const url =
      'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates&colimit=max&coprimary=primary&redirects=1&titles=' +
      encodeURIComponent(batch.join('|'));
    const res = await fetch(url, { headers: { 'User-Agent': 'dar-transit-dev/1.0' } });
    if (!res.ok) continue;
    const j = await res.json();
    for (const p of Object.values(j.query?.pages ?? {})) {
      const c = p.coordinates?.[0];
      if (c) out[p.title] = { lat: c.lat, lon: c.lon };
    }
  }
  return out;
}

// ---------- 3. Parse source files ----------
function parseStops() {
  const src = readFileSync('src/utils/dijkstra.ts', 'utf8');
  const re = /^\s{2}(\w+): \{ name: '([^']+)', lat: (-?[\d.]+), long: (-?[\d.]+) \}/gm;
  const stops = [];
  let m;
  while ((m = re.exec(src))) stops.push({ key: m[1], name: m[2], lat: +m[3], lon: +m[4] });
  return stops;
}

function parseAreas() {
  const src = readFileSync('src/data/darAreas.ts', 'utf8');
  const re = /name: '([^']+)',\s*district: '([^']+)',\s*lat: (-?[\d.]+),\s*lon: (-?[\d.]+)/g;
  const areas = [];
  let m;
  while ((m = re.exec(src))) areas.push({ name: m[1], district: m[2], lat: +m[3], lon: +m[4] });
  return areas;
}

// ---------- 4. Matching ----------
function buildIndex(elements) {
  const feats = [];
  for (const el of elements) {
    const name = el.tags?.name;
    if (!name) continue;
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    const t = el.tags;
    let kind = 'other', weight = 0;
    if (t.amenity === 'bus_station' || t.amenity === 'bus_terminal') { kind = 'terminal'; weight = 14; }
    else if (t.highway === 'bus_stop') { kind = 'bus_stop'; weight = 12; }
    else if (t.railway) { kind = 'rail'; weight = 8; }
    else if (t.place) { kind = 'place:' + t.place; weight = t.place === 'suburb' || t.place === 'neighbourhood' ? 9 : 6; }
    feats.push({ name, lat, lon, kind, weight, norm: norm(name) });
  }
  return feats;
}

function scoreMatch(query, feats, curLat, curLon) {
  const q = norm(query);
  const qTokens = q.split(' ').filter((t) => t.length > 1);
  const cands = [];
  for (const f of feats) {
    let score = 0;
    if (f.norm === q) score = 100;
    else if (f.norm.startsWith(q) || q.startsWith(f.norm)) score = 74;
    else if (f.norm.includes(q) || q.includes(f.norm)) score = 62;
    else {
      const fTokens = new Set(f.norm.split(' '));
      const hit = qTokens.filter((t) => fTokens.has(t)).length;
      if (hit === 0) continue;
      score = 34 + hit * 12;
    }
    score += f.weight;
    const d = distKm(curLat, curLon, f.lat, f.lon);
    if (d > 12) continue; // OSM "X" far outside Dar's urban area — almost always the wrong X
    cands.push({ ...f, score, d });
  }
  cands.sort((a, b) => b.score - a.score || a.d - b.d);
  return cands.slice(0, 3);
}

// ---------- main ----------
const [overpass, stops, areas] = [await fetchOverpass(), parseStops(), parseAreas()];
const feats = buildIndex(overpass.elements);

// Wikipedia for landmark-ish stops
const wikiTitles = [
  'Kariakoo', 'Muhimbili National Hospital', 'Ubungo', 'Kigamboni', 'Mbagala', 'Kimbiji',
  'Somangila', 'Mjimwema', 'Gezaulole', 'Kawe', 'Kunduchi', 'Tegeta', 'Mbezi', 'Kibamba',
  'Bunju', 'Msasani', 'Oyster Bay, Tanzania', 'Magomeni', 'Manzese', 'Tabata, Tanzania',
  'Ukonga', 'Kitunda', 'Chanika', 'Gongo la Mboto', 'Mtoni', 'Temeke', 'Chang\u2019ombe',
  'Kurasini', 'Keko', 'Mwenge, Dar es Salaam', 'Julius Nyerere International Airport',
  'University of Dar es Salaam', 'Tanzanite Bridge', 'Kariakoo Market', 'Posta',
];
console.error('Fetching Wikipedia coordinates…');
const wiki = await fetchWikiCoords(wikiTitles);
console.error(`  ${Object.keys(wiki).length} Wikipedia hits`);
const wikiFeats = Object.entries(wiki).map(([name, c]) => ({
  name: 'W: ' + name, lat: c.lat, lon: c.lon, kind: 'wikipedia', weight: 8, norm: norm(name),
}));
const allFeats = [...feats, ...wikiFeats];

const lines = [];
const proposal = { stops: {}, areas: {} };
const report = (s) => { lines.push(s); console.log(s); };

report('='.repeat(120));
report(`STOPS (${stops.length})`);
report('='.repeat(120));
for (const s of stops) {
  const queries = [s.name, ...(ALIASES[s.key] ?? [])];
  let best = null;
  const perQuery = [];
  for (const q of queries) {
    const cands = scoreMatch(q, allFeats, s.lat, s.lon);
    perQuery.push({ q, top: cands[0] ?? null });
    if (cands[0] && (!best || cands[0].score > best.score)) best = { ...cands[0], via: q };
  }
  const move = best ? distKm(s.lat, s.lon, best.lat, best.lon) : Infinity;
  const flag = !best ? 'NO MATCH' : move > 4 ? `MOVED ${move.toFixed(1)}km` : move > 1.2 ? 'shift' : 'ok';
  report(`${s.key.padEnd(20)} ${s.name.padEnd(34)} now(${fmt(s.lat)},${fmt(s.lon)})`);
  if (best) {
    report(`  -> ${best.name.padEnd(38)} [${best.kind}] ${fmt(best.lat)},${fmt(best.lon)}  d=${move.toFixed(2)}km  score=${best.score}  via="${best.via}"  ${flag}`);
    for (const c of perQuery) if (c.top && c.top !== best) report(`     alt: ${c.top.name} [${c.top.kind}] score=${c.top.score} d=${c.top.d.toFixed(2)}km`);
  } else {
    perQuery.forEach((c) => c.top && report(`     near-miss for "${c.q}": ${c.top.name} [${c.top.kind}] d=${c.top.d.toFixed(2)}km score=${c.top.score}`));
    report(`  -> ${flag}`);
  }
  if (best && best.score >= 62) proposal.stops[s.key] = { name: best.name, lat: +best.lat.toFixed(4), lon: +best.lon.toFixed(4), d: +move.toFixed(2), kind: best.kind, via: best.via };
  else if (best) proposal.stops[s.key] = { name: best.name, lat: +best.lat.toFixed(4), lon: +best.lon.toFixed(4), d: +move.toFixed(2), kind: best.kind, via: best.via, lowConfidence: true };
}

report('');
report('='.repeat(120));
report(`GAZETTEER AREAS (${areas.length})`);
report('='.repeat(120));
for (const a of areas) {
  const cands = scoreMatch(a.name, feats, a.lat, a.lon);
  const best = cands[0] ?? null;
  const move = best ? distKm(a.lat, a.lon, best.lat, best.lon) : Infinity;
  if (best && best.score >= 74) {
    report(`${a.name.padEnd(28)} (${a.district.padEnd(9)}) -> ${best.name.padEnd(30)} [${best.kind}] d=${move.toFixed(2)}km`);
    proposal.areas[a.name] = { lat: +best.lat.toFixed(4), lon: +best.lon.toFixed(4), osm: best.name, d: +move.toFixed(2) };
  } else if (best) {
    report(`${a.name.padEnd(28)} (${a.district.padEnd(9)}) ~ ${best.name.padEnd(30)} [${best.kind}] d=${move.toFixed(2)}km score=${best.score} LOW`);
    proposal.areas[a.name] = { lat: +best.lat.toFixed(4), lon: +best.lon.toFixed(4), osm: best.name, d: +move.toFixed(2), lowConfidence: true };
  } else {
    report(`${a.name.padEnd(28)} (${a.district.padEnd(9)}) NO MATCH — keeping current`);
  }
}

writeFileSync('/tmp/coords-report.txt', lines.join('\n'));
writeFileSync('/tmp/coords-proposal.json', JSON.stringify(proposal, null, 2));
console.error(`\nWrote /tmp/coords-report.txt and /tmp/coords-proposal.json`);

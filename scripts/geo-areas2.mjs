/**
 * Second pass: fix remaining darAreas.ts coordinates using verified sources:
 *  1. dijkstra.ts STOPS (verified against Wikipedia/OSM)  [highest priority]
 *  2. /tmp/wiki-coords.json (Wikipedia article coords)
 *  3. /tmp/dar-osm.json (OSM dump)
 * Query strips parenthesized suffixes ("Kibamba (Kinondoni)" -> "kibamba").
 */
import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const norm = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const stripParen = (s) => s.replace(/\s*\([^)]*\)\s*/g, ' ').trim();

const distKm = (aLat, aLon, bLat, bLon) => {
  const R = 6371, dLat = (bLat - aLat) * Math.PI / 180, dLon = (bLon - aLon) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// 1. Verified stop coords from dijkstra.ts
const stops = {};
const sre = /^\s{2}(\w+): \{ name: '([^']+)', lat: (-?[\d.]+), long: (-?[\d.]+) \}/gm;
let m;
const dij = readFileSync('src/utils/dijkstra.ts', 'utf8');
while ((m = sre.exec(dij))) stops[m[1]] = { name: m[2], lat: +m[3], lon: +m[4] };

// hand map: area display name (paren-stripped, lowercased) -> stop key
const AREA_TO_STOP = {
  'kivukoni': 'kivukoni', 'kariakoo': 'kariakoo_market', 'gerezani': 'kariakoo_gerezani',
  'kisutu': 'kariakoo_market', 'ilala boma': 'ilala', 'morocco': 'morocco',
  'mzizima': 'mzizima', 'kurasini': 'kurasini', 'mtoni': 'mtoni', 'chang\u2019ombe': 'changombe',
  'chang\'ombe': 'changombe', 'changombe': 'changombe', 'temeke mjini': 'temeke', 'temeke': 'temeke',
  'mabibo': 'mabibo', 'mlimani': 'mlimani', 'udsm': 'mlimani', 'magufuli bus terminal': 'magufuli_terminal',
  'gongo la mboto': 'gongo', 'gongolamboto': 'gongo', 'tabata kimanga': 'tabata_kimanga',
  'tabata a': 'tabata_a', 'tabata b': 'tabata_b', 'tabata keko': 'tabata_keko',
  'tabata dk': 'tabata_dk', 'tabata': 'tabata', 'segerea': 'segerea', 'tabata segerea': 'segerea',
  'banana': 'banana', 'kitunda': 'kitunda', 'chanika': 'chanika', 'viwandani': 'viwandani',
  'yombo vituka': 'viwandani', 'machimbo': 'machimbo', 'mwanagati': 'mwanagati',
  'kwa moshi': 'kwa_moshi', 'mbagala': 'mbagala', 'mbagala kuu': 'mbagala',
  'mbagala rangi tatu': 'rangi3', 'mbagala rangi 3': 'rangi3', 'rangi tatu': 'rangi3',
  'kiburugwa': 'kiburugwa', 'kongowe': 'kongowe', 'charambe': 'charambe', 'ukonga': 'ukonga',
  'buguruni': 'buguruni', 'manzese': 'manzese', 'ubungo': 'ubungo', 'kimara': 'kimara',
  'kimara mwisho': 'mbezi_mwisho', 'mbezi mwisho': 'mbezi_mwisho', 'njia panda': 'mbezi_mwisho',
  'kiluvya': 'kiluvya', 'kibamba': 'kibamba', 'goba': 'goba', 'goba kwa jombe': 'goba',
  'sinza': 'sinza', 'sinza mori': 'sinza', 'mwenge': 'mwenge', 'tegeta': 'tegeta_mwenge',
  'kawe': 'kawe', 'boko': 'boko', 'mbande': 'mbande', 'bunju': 'bunju', 'bunju a': 'bunju', 'bunju b': 'bunju',
  'mbezi beach': 'mbezi', 'mbezi': 'mbezi', 'mikocheni': 'mikocheni', 'msasani': 'msasani',
  'masaki': 'masaki', 'slipway': 'slipway', 'coco beach': 'coco_beach', 'oysterbay': 'coco_beach',
  'magomeni': 'magomeni', 'sunny side': 'sunny_side', 'posta': 'posta',
  'muhimbili national hospital': 'muhimbili', 'muhimbili': 'muhimbili',
  'msimbazi': 'msimbazi', 'jangwani': 'msimbazi', 'msimbazi / jangwani bridge': 'msimbazi',
  'tandika': 'tmj', 'mjimwema': 'tmj', 'kibugumo': 'kibugumo', 'gezaulole': 'gezaulole',
  'kisiwani': 'kisiwani', 'vijibweni': 'vijibweni', 'kimbiji': 'kimbiji', 'somangila': 'somangila',
  'tazara railway station': 'tazara', 'tazara': 'tazara', 'pugu': 'gongo',
  'magufuli terminal': 'magufuli_terminal',
};

// 2. Wikipedia anchors (hand-curated from /tmp/wiki-coords.json)
const WIKI = {
  'julius nyerere int. airport': [-6.8781, 39.2028],
  'julius nyerere international airport': [-6.8781, 39.2028],
  'national stadium': [-6.8378, 39.2700],
  'national stadium (miburani)': [-6.8378, 39.2700],
  'university of dar es salaam': [-6.7806, 39.2033],
  'national museum': [-6.8160, 39.2900],
  'azania front lutheran church': [-6.8180, 39.2930],
  'askari monument': [-6.8155, 39.2890],
  'nyerere bridge': [-6.8200, 39.3000],
  'tanzanite bridge': [-6.7919, 39.2853],
  'port of dar es salaam': [-6.8250, 39.2920],
  'tanesco headquarters': [-6.8170, 39.2870],
  'muhimbili orthopaedic institute': [-6.8080, 39.2740],
  'pande game reserve': [-6.7900, 39.1500],
  'pemba mnazi': [-7.0972, 39.4362],
  'pembanmazi': [-7.0972, 39.4362],
  'mbweni': [-6.8215, 39.2660],
  'mburahati': [-6.8000, 39.2400],
  'kibangu': [-6.8100, 39.2350],
  'kwembe': [-6.7800, 39.1900],
  'ununio': [-6.7000, 39.1900],
  'wazo': [-6.7050, 39.1800],
  'mabwepande': [-6.7200, 39.1700],
  'mlalakuwa': [-6.7700, 39.2300],
  'zingiziwa': [-6.8400, 39.2600],
  'kipunguni': [-6.8900, 39.1700],
  'minazi mirefu': [-6.8800, 39.2100],
  'vituka': [-6.8600, 39.2400],
  'vikindi': [-6.9100, 39.2900],
  'majani ya gani': [-6.9200, 39.2700],
  'charambe kwa wazee': [-6.9250, 39.2600],
  'mbutu kichangani': [-6.8900, 39.3500],
  'majohe': [-6.8271, 39.2018],
  'kiwalani': [-6.8620, 39.2286],
  'kinyerezi': [-6.8517, 39.1596],
  'vingunguti': [-6.8455, 39.2251],
  'msongola': [-6.9722, 39.1759],
  'buyuni': [-6.9100, 39.1800],
  'kivule': [-6.9333, 39.1837],
  'kupakupa': null,
};

// 3. OSM dump fallback
const osm = [];
try {
  const j = JSON.parse(readFileSync('/tmp/dar-osm.json', 'utf8'));
  for (const el of j.elements) {
    const name = el.tags?.name;
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    if (!name || lat == null) continue;
    osm.push({ name, lat, lon, norm: norm(name) });
  }
} catch {}

let src = readFileSync('src/data/darAreas.ts', 'utf8');
const re = /\{ name: '([^']+)', district: '([^']+)', lat: (-?[\d.]+), long: (-?[\d.]+) \}/g;
let fixed = 0, kept = [];
const out = [];
while ((m = re.exec(src))) {
  const [full, name, district, latS, lonS] = m;
  const cur = { lat: +latS, lon: +lonS };
  const q = norm(stripParen(name));
  let hit = null, src2 = '';
  const key = q.replace(/'/g, '\u2019');
  if (AREA_TO_STOP[q] && stops[AREA_TO_STOP[q]]) {
    hit = stops[AREA_TO_STOP[q]]; src2 = 'stop:' + AREA_TO_STOP[q];
  } else if (WIKI[q]) {
    hit = { lat: WIKI[q][0], lon: WIKI[q][1] }; src2 = 'wiki';
  } else {
    // OSM exact-name match within 15km
    let best = null;
    for (const f of osm) {
      if (f.norm === q || f.norm.startsWith(q + ' ') || f.norm.endsWith(' ' + q)) {
        const d = distKm(cur.lat, cur.lon, f.lat, f.lon);
        if (d < 15 && (!best || d < best.d)) best = { ...f, d };
      }
    }
    if (best) { hit = { lat: best.lat, lon: best.lon }; src2 = 'osm:' + best.name; }
  }
  if (hit) {
    const d = distKm(cur.lat, cur.lon, hit.lat, hit.lon);
    if (d > 0.03) {
      const repl = `{ name: '${name}', district: '${district}', lat: ${hit.lat.toFixed(4)}, long: ${hit.lon.toFixed(4)} }`;
      src = src.replace(full, repl);
      out.push(`${name.padEnd(30)} (${district.padEnd(9)}) <- ${src2.padEnd(20)} moved ${d.toFixed(2)}km`);
      fixed++;
    } else {
      out.push(`${name.padEnd(30)} (${district.padEnd(9)}) already ok (${src2})`);
      fixed++;
    }
  } else {
    kept.push(`${name} (${district})`);
  }
}
copyFileSync('src/data/darAreas.ts', '/tmp/darAreas.backup2.ts');
writeFileSync('src/data/darAreas.ts', src);
console.log(out.join('\n'));
console.log(`\nresolved: ${fixed}, unresolved: ${kept.length}`);
if (kept.length) console.log(kept.join('\n'));

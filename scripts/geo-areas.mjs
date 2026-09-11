/**
 * Rewrites darAreas.ts coordinates from the cached OSM dump (/tmp/dar-osm.json).
 * Confident match = name score >= 74 AND within 25km of current position.
 * Everything else is left untouched and reported.
 */
import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const norm = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const distKm = (aLat, aLon, bLat, bLon) => {
  const R = 6371, dLat = (bLat - aLat) * Math.PI / 180, dLon = (bLon - aLon) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const j = JSON.parse(readFileSync('/tmp/dar-osm.json', 'utf8'));
const feats = [];
for (const el of j.elements) {
  const name = el.tags?.name;
  const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
  if (!name || lat == null) continue;
  const t = el.tags;
  let w = 0;
  if (t.amenity === 'bus_station' || t.amenity === 'bus_terminal') w = 4;
  else if (t.place === 'ward' || t.place === 'suburb') w = 3;
  else if (t.place) w = 2;
  else if (t.highway === 'bus_stop') w = 1;
  if (!w) continue;
  feats.push({ name, lat, lon, w, norm: norm(name) });
}
feats.sort((a, b) => b.w - a.w);

let src = readFileSync('src/data/darAreas.ts', 'utf8');
const re = /\{ name: '([^']+)', district: '([^']+)', lat: (-?[\d.]+), long: (-?[\d.]+) \}/g;
let m, fixed = 0, missed = [];
const changes = [];
while ((m = re.exec(src))) {
  const [full, name, district, latS, lonS] = m;
  const cur = { lat: +latS, lon: +lonS };
  const q = norm(name);
  let best = null;
  for (const f of feats) {
    let s = 0;
    if (f.norm === q) s = 100;
    else if (f.norm.startsWith(q) || q.startsWith(f.norm)) s = 76;
    else if (f.norm.includes(q) || q.includes(f.norm)) s = 64;
    else {
      const qt = q.split(' ').filter((t) => t.length > 2);
      const ft = new Set(f.norm.split(' '));
      const hits = qt.filter((t) => ft.has(t)).length;
      if (!hits) continue;
      s = 30 + hits * 14;
    }
    s += f.w;
    const d = distKm(cur.lat, cur.lon, f.lat, f.lon);
    if (d > 25) continue;
    if (!best || s > best.s) best = { ...f, s, d };
  }
  if (best && best.s >= 76 && best.d > 0.05) {
    changes.push({ full, name, district, lat: best.lat.toFixed(4), lon: best.lon.toFixed(4), osm: best.name, d: best.d.toFixed(2), s: best.s });
    fixed++;
  } else if (!best || best.s < 76) {
    missed.push(`${name} (${district})`);
  }
}
for (const c of changes) {
  const repl = `{ name: '${c.name}', district: '${c.district}', lat: ${c.lat}, long: ${c.lon} }`;
  src = src.replace(c.full, repl);
  console.log(`${c.name.padEnd(26)} (${c.district.padEnd(9)}) -> ${c.osm} d=${c.d}km s=${c.s}`);
}
copyFileSync('src/data/darAreas.ts', '/tmp/darAreas.backup.ts');
writeFileSync('src/data/darAreas.ts', src);
console.log(`\nfixed: ${fixed}, unmatched (kept): ${missed.length}`);
if (missed.length) console.log('unmatched:\n  ' + missed.join('\n  '));

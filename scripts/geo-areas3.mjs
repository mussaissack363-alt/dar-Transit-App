/** Third pass: hand-place the 14 areas the automatic passes could not resolve. */
import { readFileSync, writeFileSync } from 'fs';

let src = readFileSync('src/data/darAreas.ts', 'utf8');
const fixes = [
  ['Segerea B', -6.8460, 39.1980],
  ['Kawe Mwisho', -6.7300, 39.2220],
  ['Mabwepande Kwa Ndege', -6.7230, 39.1680],
  ['Mtoni Mtongani', -6.8520, 39.2700],
  ['Julius Nyerere Int. Airport (T1/T2)', -6.8781, 39.2028],
  ['Julius Nyerere Int. Airport (T3)', -6.8785, 39.2040],
  ['Mlimani City Mall', -6.7714, 39.2210],
  ['Aga Khan Hospital', -6.7809, 39.2467],
  ['Mnazi Mmoja Grounds', -6.8180, 39.2820],
  ['Msimbazi / Jangwani Bridge', -6.8110, 39.2680],
  ['Slipway Waterfront', -6.7247, 39.2863],
  ['Kunduchi Beach & Ruins', -6.6650, 39.2100],
  ['Makumbusho Village Museum', -6.7570, 39.2350],
  ['Pugu Hills Forest Reserve', -6.8850, 39.1300],
];
let ok = 0;
for (const [name, lat, lon] of fixes) {
  const idx = src.indexOf(`{ name: '${name}', district: '`);
  if (idx < 0) { console.log('NOT FOUND:', name); continue; }
  const end = src.indexOf('}', idx);
  const seg = src.slice(idx, end + 1);
  const district = seg.match(/district: '([^']+)'/)[1];
  const repl = `{ name: '${name}', district: '${district}', lat: ${lat.toFixed(4)}, long: ${lon.toFixed(4)} }`;
  src = src.slice(0, idx) + repl + src.slice(end + 1);
  ok++;
}
writeFileSync('src/data/darAreas.ts', src);
console.log(`hand-fixed: ${ok}/${fixes.length}`);

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
};

export { STOPS as STOP_COORDS };

export const STOP_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STOPS).map(([id, s]) => [id, s.name])
);

// Rough road transit edges (minutes, base TZS)
const EDGES: Array<{ from: string; to: string; baseMinutes: number; basePriceTzs: number; label: string }> = [
  { from: 'morocco', to: 'kariakoo_gerezani', baseMinutes: 7, basePriceTzs: 400, label: 'DART M1' },
  { from: 'kariakoo_gerezani', to: 'mlelani', baseMinutes: 12, basePriceTzs: 500, label: 'Daladala quickline' },
  { from: 'mlelani', to: 'kivukoni', baseMinutes: 15, basePriceTzs: 600, label: 'DAR ferry shuttle' },
  { from: 'kivukoni', to: 'morocco', baseMinutes: 18, basePriceTzs: 650, label: 'DART ferry connector' },
  { from: 'morocco', to: 'ubungo', baseMinutes: 15, basePriceTzs: 500, label: 'Daladala Mwenge' },
  { from: 'ubungo', to: 'mzizima', baseMinutes: 20, basePriceTzs: 600, label: 'DART M2' },
  { from: 'mzizima', to: 'masaki', baseMinutes: 10, basePriceTzs: 300, label: 'Daladala Masaki' },
  { from: 'masaki', to: 'mikocheni', baseMinutes: 14, basePriceTzs: 400, label: 'Daladala Gongo La Mboto' },
  { from: 'mikocheni', to: 'damoni', baseMinutes: 9, basePriceTzs: 300, label: 'Local shuttle' },
  { from: 'damoni', to: 'tegeta_mwenge', baseMinutes: 10, basePriceTzs: 400, label: 'Daladala Tegeta' },
  { from: 'tegeta_mwenge', to: 'mikocheni', baseMinutes: 12, basePriceTzs: 400, label: 'Daladala backhaul' },
  { from: 'mikocheni', to: 'kariakoo_gerezani', baseMinutes: 15, basePriceTzs: 500, label: 'Daladala Kariakoo' },
  { from: 'kariakoo_gerezani', to: 'morocco', baseMinutes: 7, basePriceTzs: 400, label: 'DART M1 return' },
  { from: 'otrong_tire', to: 'mlelani', baseMinutes: 11, basePriceTzs: 400, label: 'Daladala Masaki' },
  { from: 'ukonga', to: 'tegeta_mwenge', baseMinutes: 13, basePriceTzs: 500, label: 'Daladala Ukonga' },
  { from: 'ukonga', to: 'mikocheni', baseMinutes: 16, basePriceTzs: 600, label: 'Daladala Mikocheni' },
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
export const FARE_REFERENCE: FareInfo[] = EDGES.map((e, i) => ({
  id: `fare-${i}`,
  label: e.label,
  fromName: STOPS[e.from]?.name ?? e.from,
  toName: STOPS[e.to]?.name ?? e.to,
  standardTzs: e.basePriceTzs,
  typicalLowTzs: e.basePriceTzs,
  typicalHighTzs: Math.round(e.basePriceTzs * 1.4 / 50) * 50,
  note:
    e.label.startsWith('DART')
      ? 'BRT card fare — fixed at the terminal gate, no conductor negotiation.'
      : e.label.includes('ferry')
        ? 'Ferry/fare is posted at the ramp — queue marshals can confirm.'
        : 'Daladala cash fare — agree before boarding; hikes are common at peak hours.',
}));

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
 * Best-first enumeration of distinct simple paths, cheapest-first.
 * The graph is small, so an exhaustive-ish scan with a cap is plenty
 * and gives us real alternatives, not just the single optimum.
 */
function enumeratePaths(
  startStopId: string,
  endStopId: string,
  scenarioId: ScenarioId,
  reports: CommuterReport[],
  maxPaths = 3
): PathState[] {
  const found: PathState[] = [];
  const queue: PathState[] = [{ nodes: [startStopId], minutes: 0, cost: 0 }];
  let expansions = 0;

  while (queue.length && found.length < maxPaths && expansions < 600) {
    queue.sort((a, b) => a.minutes - b.minutes);
    const state = queue.shift()!;
    expansions += 1;
    const node = state.nodes[state.nodes.length - 1];

    if (node === endStopId) {
      found.push(state);
      continue;
    }
    if (state.nodes.length >= 8) continue;

    for (const adj of ADJ.get(node) ?? []) {
      if (state.nodes.includes(adj.to)) continue; // simple paths only
      const { delayMinutes, priceDeltaTzs } = edgeDelay(
        node,
        adj.to,
        adj.edge.basePriceTzs,
        scenarioId,
        reports
      );
      queue.push({
        nodes: [...state.nodes, adj.to],
        minutes: state.minutes + adj.edge.baseMinutes + delayMinutes,
        cost:
          state.cost +
          adj.edge.basePriceTzs +
          scenarioSurcharge(adj.edge.basePriceTzs, scenarioId) +
          priceDeltaTzs,
      });
    }
  }

  return found;
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
 * isFastest / isCheapest so the UI can badge them.
 */
export function calculateRouteOptions(
  startStopId: string,
  endStopId: string,
  scenarioId: ScenarioId,
  reports: CommuterReport[]
): TransitRouteResult[] {
  if (!STOPS[startStopId] || !STOPS[endStopId] || startStopId === endStopId) return [];

  const options = enumeratePaths(startStopId, endStopId, scenarioId, reports)
    .map((p) => buildResult(p.nodes, scenarioId, reports))
    .filter((r) => r.legs.length > 0)
    .sort((a, b) => a.duration - b.duration);

  if (options.length > 0) options[0].isFastest = true;
  const cheapest = options.reduce(
    (min, r) => (r.cost < min.cost ? r : min),
    options[0]
  );
  if (cheapest) cheapest.isCheapest = true;

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

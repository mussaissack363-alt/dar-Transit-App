/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScenarioId, CommuterReport, TransitRouteResult, ReportLeg } from '../types';

const STOPS: Record<string, { name: string; lat: number; long: number }> = {
  ukonga: { name: 'Ukonga', lat: -6.8306, long: 39.2800 },
  morocco: { name: 'Morocco DART Terminal', lat: -6.7702, long: 39.2450 },
  ubungo: { name: 'Ubungo Interchange', lat: -6.7845, long: 39.2965 },
  kivukoni: { name: 'Kivukoni Ferry Terminal', lat: -6.7760, long: 39.2180 },
  kariakoo_gerezani: { name: 'Kariakoo Gerezani', lat: -6.7615, long: 39.2620 },
  mlelani: { name: 'Mlelani Street', lat: -6.7300, long: 39.2650 },
  masaki: { name: 'Masaki Junction', lat: -6.7120, long: 39.3120 },
  otrong_tire: { name: "Otrong’i Tire", lat: -6.7380, long: 39.2825 },
  mikocheni: { name: 'Mikocheni Road', lat: -6.7540, long: 39.2830 },
  damoni: { name: 'Damoni Circle', lat: -6.7510, long: 39.2880 },
  tegeta_mwenge: { name: 'Tegeta-Mwenge Daladala Hub', lat: -6.8000, long: 39.2500 },
  mzizima: { name: 'Mzizima DART Stop', lat: -6.7995, long: 39.3070 },
};

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
  { from: 'otrong Tire', to: 'mlelani', baseMinutes: 11, basePriceTzs: 400, label: 'Daladala Masaki' },
  { from: 'ukonga', to: 'tegeta_mwenge', baseMinutes: 13, basePriceTzs: 500, label: 'Daladala Ukonga' },
  { from: 'ukonga', to: 'mikocheni', baseMinutes: 16, basePriceTzs: 600, label: 'Daladala Mikocheni' },
];

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
  scenario: ScenarioId,
  reports: CommuterReport[]
): { delayMinutes: number; priceDeltaTzs: number } {
  let delayMinutes = 0;
  let priceDeltaTzs = 0;

  for (const r of reports) {
    if (r.type === 'traffic') {
      if (r.targetId === from || r.targetId === to) {
        if (r.severity === 'high') delayMinutes += 18;
        else if (r.severity === 'medium') delayMinutes += 10;
        else delayMinutes += 4;
      }
    }
    if (r.type === 'price' && r.targetType === 'Route' && r.targetId === from + '-' + to) {
      if (typeof r.priceValue === 'number') {
        priceDeltaTzs = Math.max(priceDeltaTzs, r.priceValue - 0);
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

export function calculateTransitRoute(
  startStopId: string,
  endStopId: string,
  scenarioId: ScenarioId,
  reports: CommuterReport[]
): TransitRouteResult | null {
  if (!STOPS[startStopId] || !STOPS[endStopId]) return null;

  type Node = string;
  const dist = new Map<Node, number>();
  const prev: Map<Node, { from: Node; edge: typeof EDGES[number] }> = new Map();
  const visited = new Set<Node>();
  dist.set(startStopId, 0);

  const priorityQueue: Node[] = [startStopId];

  while (priorityQueue.length) {
    priorityQueue.sort((a, b) => (dist.get(a) ?? Infinity) - (dist.get(b) ?? Infinity));
    const current = priorityQueue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    if (current === endStopId) break;

    const currentDist = dist.get(current) ?? Infinity;

    for (const edge of EDGES) {
      if (edge.from !== current) continue;
      const { delayMinutes, priceDeltaTzs } = edgeDelay(edge.from, edge.to, scenarioId, reports);
      const costMinutes = edge.baseMinutes + delayMinutes;
      const costTzs =
        edge.basePriceTzs +
        (scenarioId === 'heavy-rain' || scenarioId === 'heavy-fog'
          ? Math.ceil(edge.basePriceTzs * 0.08)
          : 0) +
        priceDeltaTzs;

      const nextDist = currentDist + costMinutes;
      if (nextDist < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, nextDist);
        prev.set(edge.to, { from: current, edge });
        priorityQueue.push(edge.to);
      }
    }
  }

  if (!prev.has(endStopId)) return null;

  const legs: ReportLeg[] = [];
  let pointer = endStopId;
  let totalDuration = 0;
  let totalCost = 0;
  let totalDistance = 0;

  while (pointer !== startStopId) {
    const step = prev.get(pointer);
    if (!step) break;
    const { from, edge } = step;
    const { delayMinutes, priceDeltaTzs } = edgeDelay(from, pointer, scenarioId, reports);
    const durationMinutes = edge.baseMinutes + delayMinutes;
    const priceTzs =
      edge.basePriceTzs +
      (scenarioId === 'heavy-rain' || scenarioId === 'heavy-fog'
        ? Math.ceil(edge.basePriceTzs * 0.08)
        : 0) +
      priceDeltaTzs;

    const fromStop = STOPS[from];
    const toStop = STOPS[pointer];
    const approxDistance = distanceMetres(fromStop, toStop) / 1000;
    totalDistance += approxDistance;
    totalDuration += durationMinutes;
    totalCost += priceTzs;

    legs.unshift({
      from,
      to: pointer,
      mode: edge.label,
      priceTzs,
      durationMinutes,
    });

    pointer = from;
  }

  return {
    start: startStopId,
    end: endStopId,
    scenario: scenarioId,
    legs,
    duration: totalDuration,
    cost: totalCost,
    distance: Math.round(totalDistance),
  };
}

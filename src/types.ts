/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScenarioId = 'normal' | 'heavy-fog' | 'heavy-rain';

export type SeverityLabel = 'low' | 'medium' | 'high';

export type AutoBulletinSourceLabel =
  | 'unknown'
  | 'rss_json'
  | 'transit_authority'
  | 'social_signal'
  | 'gemini_detected';

export interface AutoBulletin {
  id: string;
  source: AutoBulletinSourceLabel;
  originId: string | null;
  title: string;
  summary: string;
  affectedStopId: string | null;
  affectedRouteId: string | null;
  severity: SeverityLabel | null;
  issuedAt: string;
  ingestedAt: string;
}

export interface AutoBulletinConfig {
  sourceUrl: string | null;
  pollSeconds: number;
  enabled: boolean;
}

export interface ReportLeg {
  from: string;
  to: string;
  mode: string;
  priceTzs?: number;
  durationMinutes: number;
  /** Human-readable stop names, resolved server-side for display. */
  fromName?: string;
  toName?: string;
  /** Fare breakdown: posted base fare before hikes/surcharges. */
  baseTzs?: number;
  /** Weather-scenario surcharge (e.g. rain bump). */
  surgeTzs?: number;
  /** Extra TZS over base reported by commuters (conductor hikes). */
  crowdHikeTzs?: number;
  /** Extra minutes caused by crowd-reported traffic/conditions. */
  crowdDelayMinutes?: number;
}

export interface TransitRouteResult {
  start: string;
  end: string;
  scenario: ScenarioId;
  legs: ReportLeg[];
  duration: number;
  cost: number;
  distance: number;
  /** Alternative plans for the same trip, sorted after this one. */
  alternatives?: TransitRouteResult[];
  isFastest?: boolean;
  isCheapest?: boolean;
}

/** Posted vs typical fare for a service, used by the fare-check panel. */
export interface FareInfo {
  id: string;
  label: string;
  fromName: string;
  toName: string;
  standardTzs: number;
  typicalLowTzs: number;
  typicalHighTzs: number;
  note: string;
}

export interface CommuterReport {
  id: string;
  type: 'price' | 'condition' | 'traffic';
  targetType: 'Route' | 'Stop';
  targetId: string;
  title: string;
  details: string;
  reporterName: string;
  timestamp: string;
  votes: number;
  priceValue?: number;
  severity?: 'low' | 'medium' | 'high';
  /** Estimated extra minutes this issue adds to a trip through the target. */
  delayMinutes?: number;
  /** ISO timestamp of when the report was filed (drives active/archive state). */
  createdAt: string;
}

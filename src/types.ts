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
}

export interface TransitRouteResult {
  start: string;
  end: string;
  scenario: ScenarioId;
  legs: ReportLeg[];
  duration: number;
  cost: number;
  distance: number;
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
}

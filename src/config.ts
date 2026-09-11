/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Frontend API base.
 * Keep this in one place so the auto traffic UI and any future backend calls
 * can be pointed at the right backend without scattering URLs across components.
 */
export const API_BASE = '';

export const AUTO_TRAFFIC_ENDPOINTS = {
  bulletins: `${API_BASE}/api/traffic/auto-bulletins`,
  latest: (count: number) => `${API_BASE}/api/traffic/auto-bulletins/latest?count=${count}`,
  status: `${API_BASE}/api/traffic/auto-ingest/status`,
  seedSample: `${API_BASE}/api/traffic/auto-ingest/seed-sample`,
};

/**
 * When there is no real public JSON feed wired yet, the C# API can still
 * serve sample auto bulletins for UI development.
 */
export const AUTO_TRAFFIC_SEED_SAMPLE_ON_LOAD = false;

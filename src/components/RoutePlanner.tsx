/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TransitRouteResult, ReportLeg } from '../types';
import { RouteMap } from './RouteMap';
import { StopSearch, StopOption } from './StopSearch';
import { STOP_COORDS } from '../utils/dijkstra';

const STOP_OPTIONS: StopOption[] = Object.entries(STOP_COORDS)
  .map(([id, s]) => ({ id, name: s.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const SCENARIO_OPTIONS = [
  { id: 'normal', label: 'Normal daytime' },
  { id: 'heavy-rain', label: 'Heavy rain (Jangwani overflow)' },
  { id: 'heavy-fog', label: 'Heavy fog (early mornings)' },
];

function LegFareBreakdown({ leg }: { leg: ReportLeg }) {
  return (
    <span className="leg-meta">
      {leg.durationMinutes} min
      {typeof leg.crowdDelayMinutes === 'number' && leg.crowdDelayMinutes > 0 && (
        <em className="leg-crowd-delay"> · +{leg.crowdDelayMinutes} min traffic</em>
      )}
      {' · '}
      {typeof leg.baseTzs === 'number' ? (
        <>
          {leg.baseTzs} TZS
          {typeof leg.surgeTzs === 'number' && <em className="leg-surge"> +{leg.surgeTzs} weather</em>}
          {typeof leg.crowdHikeTzs === 'number' && (
            <em className="leg-hike"> +{leg.crowdHikeTzs} hike</em>
          )}
          {typeof leg.priceTzs === 'number' && (leg.surgeTzs || leg.crowdHikeTzs) ? (
            <> = {leg.priceTzs} TZS</>
          ) : null}
        </>
      ) : (
        <>{leg.priceTzs} TZS</>
      )}
    </span>
  );
}

function OptionCard({
  option,
  rank,
  onHover,
}: {
  option: TransitRouteResult;
  rank: number;
  onHover: (o: TransitRouteResult | null) => void;
}) {
  return (
    <div
      className={`route-option card${option.isFastest ? ' option-fastest' : ''}`}
      onMouseEnter={() => onHover(option)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="option-head">
        <h3 className="card-title">
          {rank === 1 ? 'Recommended' : `Alternative ${rank - 1}`}:{' '}
          {Math.round(option.duration)} min · {option.cost} TZS · ~{option.distance} km
        </h3>
        <div className="option-badges">
          {option.isFastest && <span className="badge badge-fastest">Fastest</span>}
          {option.isCheapest && <span className="badge badge-cheapest">Cheapest</span>}
        </div>
      </div>

      <ol className="legs">
        {option.legs.map((leg, idx) => (
          <li key={idx} className="leg">
            <span className="leg-mode">{leg.mode}</span>
            <span className="leg-route">
              {leg.fromName ?? leg.from} → {leg.toName ?? leg.to}
            </span>
            <LegFareBreakdown leg={leg} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RoutePlanner() {
  const [startStopId, setStartStopId] = useState('');
  const [endStopId, setEndStopId] = useState('');
  const [scenarioId, setScenarioId] = useState<'normal' | 'heavy-rain' | 'heavy-fog'>('normal');
  const [route, setRoute] = useState<TransitRouteResult | null>(null);
  const [highlighted, setHighlighted] = useState<TransitRouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlan = async () => {
    if (!startStopId || !endStopId) {
      setError('Please choose start and destination.');
      return;
    }
    if (startStopId === endStopId) {
      setError('Start and destination are the same stop.');
      return;
    }
    setLoading(true);
    setError(null);
    setRoute(null);
    setHighlighted(null);
    try {
      const res = await fetch('/api/route-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startStopId, endStopId, scenarioId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to plan route.');
        return;
      }
      setRoute(data);
    } catch {
      setError('Network error while planning route — is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const allOptions = route ? [route, ...(route.alternatives ?? [])] : [];
  const mapRoute = highlighted ?? route;
  const startName = STOP_OPTIONS.find((s) => s.id === startStopId)?.name ?? '';
  const endName = STOP_OPTIONS.find((s) => s.id === endStopId)?.name ?? '';

  return (
    <section className="dashboard-section">
      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Plan your trip</h2>
          <p className="card-subtitle">
            Search any stop, compare up to 3 plans, and see exactly where fares and delays come from.
          </p>
        </div>

        <div className="form-grid">
          <StopSearch
            id="start"
            label="Start stop"
            options={STOP_OPTIONS}
            value={startStopId}
            onChange={setStartStopId}
            placeholder="e.g. Morocco, Ubungo, ferry…"
          />
          <StopSearch
            id="end"
            label="Destination"
            options={STOP_OPTIONS}
            value={endStopId}
            onChange={setEndStopId}
            placeholder="e.g. Masaki, Kariakoo…"
          />
          <div className="field">
            <label htmlFor="scenario">Scenario</label>
            <select
              id="scenario"
              value={scenarioId}
              onChange={(event) => setScenarioId(event.target.value as typeof scenarioId)}
              aria-label="Travel scenario"
            >
              {SCENARIO_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={handlePlan}
            disabled={loading || !startStopId || !endStopId}
          >
            {loading ? 'Calculating…' : 'Plan route'}
          </button>
        </div>

        {error && (
          <p className="text-error" role="alert">
            {error}
          </p>
        )}

        <RouteMap route={mapRoute} startStopId={startStopId} endStopId={endStopId} />

        {route && (
          <div className="route-results">
            <div className="card-head">
              <h3 className="card-title">
                {startName} → {endName}
              </h3>
              <p className="card-subtitle">
                {SCENARIO_OPTIONS.find((o) => o.id === route.scenario)?.label ?? route.scenario} ·
                hover a plan to trace it on the map
              </p>
            </div>
            {allOptions.map((option, idx) => (
              <OptionCard key={idx} option={option} rank={idx + 1} onHover={setHighlighted} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

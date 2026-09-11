/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TransitRouteResult } from '../types';

const STOP_OPTIONS = [
  { id: 'morocco', name: 'Morocco DART Terminal' },
  { id: 'kariakoo_gerezani', name: 'Kariakoo Gerezani' },
  { id: 'mlelani', name: 'Mlelani Street' },
  { id: 'kivukoni', name: 'Kivukoni Ferry Terminal' },
  { id: 'ubungo', name: 'Ubungo Interchange' },
  { id: 'mzizima', name: 'Mzizima DART Stop' },
  { id: 'masaki', name: 'Masaki Junction' },
  { id: 'mikocheni', name: 'Mikocheni Road' },
  { id: 'damoni', name: 'Damoni Circle' },
  { id: 'tegeta_mwenge', name: 'Tegeta-Mwenge Hub' },
  { id: 'ukonga', name: 'Ukonga' },
];

const SCENARIO_OPTIONS = [
  { id: 'normal', label: 'Normal daytime' },
  { id: 'heavy-rain', label: "Heavy rain (Jangwani overflow)" },
  { id: 'heavy-fog', label: 'Heavy fog (early mornings)' },
];

export function RoutePlanner() {
  const [startStopId, setStartStopId] = useState('');
  const [endStopId, setEndStopId] = useState('');
  const [scenarioId, setScenarioId] = useState<'normal' | 'heavy-rain' | 'heavy-fog'>('normal');
  const [route, setRoute] = useState<TransitRouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlan = async () => {
    if (!startStopId || !endStopId) {
      setError('Please choose start and end stops.');
      return;
    }
    setLoading(true);
    setError(null);
    setRoute(null);
    try {
      const res = await fetch('/api/route-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startStopId,
          endStopId,
          scenarioId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to plan route.');
        return;
      }
      setRoute(data);
    } catch {
      setError('Network error while planning route.');
    } finally {
      setLoading(false);
    }
  };

  const startName = STOP_OPTIONS.find((s) => s.id === startStopId)?.name ?? '';
  const endName = STOP_OPTIONS.find((s) => s.id === endStopId)?.name ?? '';

  return (
    <section className="dashboard-section">
      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Plan your trip</h2>
          <p className="card-subtitle">
            Compare DART, daladala, and ferry options across Dar es Salaam stops.
          </p>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="start">Start stop</label>
            <select
              id="start"
              value={startStopId}
              onChange={(event) => setStartStopId(event.target.value)}
              aria-label="Start stop"
            >
              <option value="">Select start...</option>
              {STOP_OPTIONS.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="end">End stop</label>
            <select
              id="end"
              value={endStopId}
              onChange={(event) => setEndStopId(event.target.value)}
              aria-label="End stop"
            >
              <option value="">Select destination...</option>
              {STOP_OPTIONS.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
          </div>

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
            {loading ? 'Calculating...' : 'Plan route'}
          </button>
        </div>

        {error && (
          <p className="text-error" role="alert">
            {error}
          </p>
        )}

        {route && (
          <div className="route-result card">
            <div className="card-head">
              <h3 className="card-title">
                {startName} → {endName}
              </h3>
              <p className="card-subtitle">
                {SCENARIO_OPTIONS.find((o) => o.id === route.scenario)?.label ?? route.scenario}
              </p>
            </div>

            <dl className="stats-grid">
              <div>
                <dt>Total time</dt>
                <dd>{route.duration} min</dd>
              </div>
              <div>
                <dt>Estimated fare</dt>
                <dd>{route.cost} TZS</dd>
              </div>
              <div>
                <dt>Approx distance</dt>
                <dd>{route.distance} km</dd>
              </div>
            </dl>

            <h4 className="section-title">Segments</h4>
            <ol className="legs">
              {route.legs.map((leg, idx) => {
                const fromOption = STOP_OPTIONS.find((s) => s.id === leg.from);
                const toOption = STOP_OPTIONS.find((s) => s.id === leg.to);
                return (
                  <li key={idx} className="leg">
                    <span className="leg-mode">{leg.mode}</span>
                    <span className="leg-route">
                      {fromOption?.name} → {toOption?.name}
                    </span>
                    <span className="leg-meta">
                      {leg.durationMinutes} min · {leg.priceTzs} TZS
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}


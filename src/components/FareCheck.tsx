/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FareInfo } from '../types';

/**
 * Fare-check panel: posted standards vs what conductors actually ask,
 * so commuters can spot an unreasonable hike instantly.
 */
export function FareCheck() {
  const [fares, setFares] = useState<FareInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [overThreshold, setOverThreshold] = useState(20);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/fares');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('bad payload');
        setFares(data);
      } catch {
        setError('Could not load fare reference. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fares;
    return fares.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.fromName.toLowerCase().includes(q) ||
        f.toName.toLowerCase().includes(q)
    );
  }, [fares, query]);

  return (
    <section className="dashboard-section">
      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Fare check</h2>
          <p className="card-subtitle">
            Posted standard fares vs what conductors typically ask. Anything above the
            typical-high band is overcharging — agree on the fare before you board.
          </p>
        </div>

        <div className="fare-controls">
          <input
            type="search"
            className="fare-search"
            placeholder="Search route or stop… e.g. M1, Kariakoo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search fares"
          />
          <label className="fare-threshold">
            Flag hikes over
            <select
              value={overThreshold}
              onChange={(e) => setOverThreshold(Number(e.target.value))}
            >
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={50}>50%</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-muted">Loading fares…</p>
        ) : error ? (
          <p className="text-error" role="alert">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted">No fares match “{query}”.</p>
        ) : (
          <div className="fare-table-wrap">
            <table className="fare-table">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Corridor</th>
                  <th scope="col" className="num">Standard</th>
                  <th scope="col" className="num">Typical high</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const hikePct = Math.round(((f.typicalHighTzs - f.standardTzs) / f.standardTzs) * 100);
                  const flagged = hikePct > overThreshold;
                  return (
                    <tr key={f.id} className={flagged ? 'fare-flagged' : ''}>
                      <td className="fare-service">{f.label}</td>
                      <td>{f.fromName} ↔ {f.toName}</td>
                      <td className="num">{f.standardTzs} TZS</td>
                      <td className="num">
                        {f.typicalHighTzs} TZS
                        <span className={`fare-hike-pct${flagged ? ' high' : ''}`}>
                          +{hikePct}%
                        </span>
                      </td>
                      <td className="fare-note">{f.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

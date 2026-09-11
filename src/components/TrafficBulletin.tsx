/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

export function TrafficBulletin() {
  const [bulletin, setBulletin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    setBulletin(null);
    try {
      const res = await fetch('/api/traffic-analysis');
      const data = await res.json();
      if (!res.ok || typeof data.bulletin !== 'string') {
        setError('Could not load traffic bulletin.');
        return;
      }
      setBulletin(data.bulletin);
    } catch {
      setError('Network error while loading the bulletin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <section className="dashboard-section">
      <div className="card bulletin-card">
        <div className="card-head">
          <h2 className="card-title">Dar Commute Intelligence Bulletin</h2>
          <p className="card-subtitle">
            Live commuter-reported transit analysis for Dar es Salaam.
          </p>
        </div>

        <div className="card-actions">
          <button className="btn btn-ghost" type="button" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh bulletin'}
          </button>
        </div>

        {error ? (
          <p className="text-error" role="alert">{error}</p>
        ) : !bulletin ? (
          <p className="text-muted">Generating bulletin…</p>
        ) : (
          <div className="bulletin-body">
            <p className="text-base leading-relaxed">{bulletin}</p>
          </div>
        )}
      </div>
    </section>
  );
}

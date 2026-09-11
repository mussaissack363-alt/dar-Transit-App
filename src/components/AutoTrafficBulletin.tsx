/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AutoBulletin, AutoBulletinConfig } from '../types';
import { AUTO_TRAFFIC_ENDPOINTS, AUTO_TRAFFIC_SEED_SAMPLE_ON_LOAD } from '../config';

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function severityLabel(severity: 'low' | 'medium' | 'high' | null): string {
  if (severity === 'high') return 'High';
  if (severity === 'medium') return 'Medium';
  if (severity === 'low') return 'Low';
  return 'Unrated';
}

function severityClass(severity: 'low' | 'medium' | 'high' | null): string {
  if (severity === 'high') return 'sev-high';
  if (severity === 'medium') return 'sev-medium';
  if (severity === 'low') return 'sev-low';
  return 'sev-unrated';
}

export function AutoTrafficBulletin() {
  const [bulletins, setBulletins] = useState<AutoBulletin[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AutoBulletinConfig | null>(null);

  const fetchBulletins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(AUTO_TRAFFIC_ENDPOINTS.latest(20));
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        setError('Could not load auto traffic updates.');
        return;
      }
      setBulletins(data);
    } catch {
      setError('Network error while loading auto traffic updates.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(AUTO_TRAFFIC_ENDPOINTS.status);
      const data = await res.json();
      if (res.ok && data?.enabled !== undefined) {
        setConfig(data);
      }
    } catch {
      // Non-blocking: status is nice to have, not required for the list UI.
    }
  }, []);

  useEffect(() => {
    fetchBulletins();
    if (AUTO_TRAFFIC_SEED_SAMPLE_ON_LOAD) {
      fetch(`${AUTO_TRAFFIC_ENDPOINTS.seedSample}`, { method: 'POST' }).catch(() => {});
    }
    fetchConfig();
  }, [fetchBulletins, fetchConfig]);

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await fetch(AUTO_TRAFFIC_ENDPOINTS.seedSample, { method: 'POST' }).catch(() => {});
      await fetchBulletins();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="dashboard-section">
      <div className="card bulletin-card">
        <div className="card-head">
          <h2 className="card-title">Auto Traffic Updates</h2>
          <p className="card-subtitle">
            Separate from commuter reports. Automatically ingested from public JSON feeds.
          </p>
        </div>

        <div className="card-actions">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={refresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh updates'}
          </button>
          {config ? (
            <span className="ingest-status">
              {config.enabled
                ? `Ingest on` +
                  (config.sourceUrl
                    ? ` · ${config.sourceUrl}`
                    : ' · no feed URL')
                : 'Ingest off'}
            </span>
          ) : null}
        </div>

        {error ? (
          <p className="text-error" role="alert">{error}</p>
        ) : bulletins.length === 0 ? (
          <p className="text-muted">No auto updates yet.</p>
        ) : (
          <ul className="auto-bulletin-list" role="list">
            {bulletins.map((item) => (
              <li key={item.id} className={`auto-bulletin-item ${severityClass(item.severity)}`}>
                <div className="auto-bulletin-head">
                  <span className="pill pill-source">{item.source}</span>
                  <span className={`pill pill-severity ${severityClass(item.severity)}`}>
                    {severityLabel(item.severity)}
                  </span>
                  <time className="text-muted text-xs" dateTime={item.ingestedAt}>
                    {formatTime(item.ingestedAt)}
                  </time>
                </div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-foreground-muted">{item.summary}</p>
                {item.affectedStopId ? (
                  <span className="pill pill-tag">Stop: {item.affectedStopId}</span>
                ) : null}
                {item.affectedRouteId ? (
                  <span className="pill pill-tag">Route: {item.affectedRouteId}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

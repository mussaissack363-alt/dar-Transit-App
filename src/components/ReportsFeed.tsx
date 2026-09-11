/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CommuterReport } from '../types';

const TYPE_LABELS: Record<CommuterReport['type'], string> = {
  price: 'Fare update',
  condition: 'Condition',
  traffic: 'Traffic',
};

const TARGET_TYPE_LABELS: Record<CommuterReport['targetType'], string> = {
  Route: 'Route',
  Stop: 'Stop',
};

export function ReportsFeed() {
  const [reports, setReports] = useState<CommuterReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<{
    type: CommuterReport['type'];
    targetType: CommuterReport['targetType'];
    targetId: string;
    title: string;
    details: string;
    reporterName: string;
    priceValue: string;
    severity: CommuterReport['severity'] | undefined;
  }>({
    type: 'condition',
    targetType: 'Stop',
    targetId: '',
    title: '',
    details: '',
    reporterName: '',
    priceValue: '',
    severity: undefined,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitReport = async () => {
    if (!form.type || !form.targetType || !form.targetId || !form.title || !form.details || !form.reporterName) {
      return;
    }
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          targetType: form.targetType,
          targetId: form.targetId,
          title: form.title,
          details: form.details,
          reporterName: form.reporterName,
          priceValue: form.priceValue || undefined,
          severity: form.severity || undefined,
        }),
      });
      const data = await res.json();
      if (data.report) {
        setReports((prev) => [data.report, ...prev]);
        setForm({
          type: 'condition',
          targetType: 'Stop',
          targetId: '',
          title: '',
          details: '',
          reporterName: '',
          priceValue: '',
          severity: undefined,
        });
      }
    } catch {
      // ignore
    }
  };

  const vote = async (id: string, voteType: 'up' | 'down') => {
    try {
      const res = await fetch('/api/reports/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, voteType }),
      });
      const data = await res.json();
      if (data.success !== false) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, votes: data.votes ?? r.votes } : r))
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <section className="dashboard-section">
      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Commuter-reported updates</h2>
          <p className="card-subtitle">
            Crowd-sourced conditions, fares, and traffic notes from other riders.
          </p>
        </div>

        {loading ? (
          <p className="text-muted">Loading reports…</p>
        ) : reports.length === 0 ? (
          <p className="text-muted">No active updates yet.</p>
        ) : (
          <ul className="report-list" role="list">
            {reports.map((report) => (
              <li key={report.id} className="report-item">
                <div className="report-meta-row">
                  <span className="pill pill-source">{TYPE_LABELS[report.type]}</span>
                  <span className="text-sm text-muted">
                    {TARGET_TYPE_LABELS[report.targetType]} — {report.targetId}
                  </span>
                  {report.severity && (
                    <span className={`pill pill-severity sev-${report.severity}`}>
                      {report.severity}
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold">{report.title}</p>
                <p className="text-sm text-foreground-muted">{report.details}</p>
                <p className="text-xs text-muted">
                  Reported by {report.reporterName} · {report.timestamp}
                  {typeof report.priceValue === 'number' ? ` · ~${report.priceValue} TZS` : ''}
                </p>
                <div className="report-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs vote-up"
                    onClick={() => vote(report.id, 'up')}
                  >
                    ▲
                  </button>
                  <span className="vote-count">{report.votes}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs vote-down"
                    onClick={() => vote(report.id, 'down')}
                  >
                    ▼
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Share an update</h3>
          <p className="card-subtitle">
            Help other commuters by reporting what you see on the ground.
          </p>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="rep-type">Update type</label>
            <select
              id="rep-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CommuterReport['type'] })}
            >
              <option value="price">Price update</option>
              <option value="condition">Condition</option>
              <option value="traffic">Traffic</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="rep-target-type">Target kind</label>
            <select
              id="rep-target-type"
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value as CommuterReport['targetType'] })}
            >
              <option value="Stop">Stop</option>
              <option value="Route">Route</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="rep-target">Target ID</label>
            <input
              id="rep-target"
              type="text"
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
              placeholder="e.g. morocco or daladala_d1"
            />
          </div>
          <div className="field">
            <label htmlFor="rep-title">Short title</label>
            <input
              id="rep-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Turnstile broken"
            />
          </div>
          <div className="field field-full">
            <label htmlFor="rep-details">What's happening?</label>
            <textarea
              id="rep-details"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Describe delays, fare changes, or road conditions..."
              rows={3}
            />
          </div>
          <div className="field">
            <label htmlFor="rep-reporter">Your name</label>
            <input
              id="rep-reporter"
              type="text"
              value={form.reporterName}
              onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
              placeholder="Nama yako"
            />
          </div>
          {(form.type === 'price') && (
            <div className="field">
              <label htmlFor="rep-price">New fare (TZS)</label>
              <input
                id="rep-price"
                type="number"
                value={form.priceValue}
                onChange={(e) => setForm({ ...form, priceValue: e.target.value })}
                placeholder="700"
              />
            </div>
          )}
          {(form.type === 'condition' || form.type === 'traffic') && (
            <div className="field">
              <label htmlFor="rep-severity">Severity</label>
              <select
                id="rep-severity"
                value={form.severity ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    severity: (e.target.value as CommuterReport['severity']) || undefined,
                  })
                }
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={submitReport}
            disabled={!form.title || !form.details || !form.reporterName || !form.targetId}
          >
            Submit update
          </button>
        </div>
      </div>
    </section>
  );
}


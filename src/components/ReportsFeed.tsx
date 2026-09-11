/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CommuterReport } from '../types';
import { STOP_NAMES as SHARED_STOP_NAMES } from '../utils/dijkstra';

const TYPE_LABELS: Record<CommuterReport['type'], string> = {
  price: 'Fare update',
  condition: 'Condition',
  traffic: 'Traffic',
};

const STOP_NAMES: Record<string, string> = SHARED_STOP_NAMES;

const STOP_IDS = Object.keys(STOP_NAMES);

function targetLabel(r: CommuterReport): string {
  return STOP_NAMES[r.targetId] ?? r.targetId;
}

/** Human age of a report from its createdAt timestamp. */
function ageLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return '';
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

function severityClass(severity: CommuterReport['severity']): string {
  if (severity === 'high') return 'sev-high';
  if (severity === 'medium') return 'sev-medium';
  return 'sev-low';
}

type Scope = 'active' | 'archive';
type ArchiveRange = 1 | 7 | 30;

function ReportCard({
  report,
  onVote,
  compact,
}: {
  report: CommuterReport;
  onVote: (id: string, voteType: 'up' | 'down') => void;
  compact?: boolean;
}) {
  return (
    <li className={`report-item ${severityClass(report.severity)}${compact ? ' report-archived' : ''}`}>
      <div className="report-meta-row">
        <span className="pill pill-source">{TYPE_LABELS[report.type]}</span>
        <span className="pill pill-tag">{targetLabel(report)}</span>
        {report.severity && (
          <span className={`pill pill-severity ${severityClass(report.severity)}`}>
            {report.severity}
          </span>
        )}
        {typeof report.delayMinutes === 'number' && report.delayMinutes > 0 && (
          <span className="pill pill-delay">+{report.delayMinutes} min delay</span>
        )}
      </div>
      <p className="text-base font-semibold">{report.title}</p>
      <p className="text-sm text-foreground-muted">{report.details}</p>
      <p className="text-xs text-muted">
        Reported by {report.reporterName} · {ageLabel(report.createdAt)}
        {typeof report.priceValue === 'number' ? ` · ~${report.priceValue} TZS` : ''}
      </p>
      <div className="report-actions">
        <button
          type="button"
          className="btn btn-ghost btn-xs vote-up"
          onClick={() => onVote(report.id, 'up')}
          aria-label="Confirm this report"
        >
          ▲
        </button>
        <span className="vote-count">{report.votes}</span>
        <button
          type="button"
          className="btn btn-ghost btn-xs vote-down"
          onClick={() => onVote(report.id, 'down')}
          aria-label="Dispute this report"
        >
          ▼
        </button>
        <span className="text-xs text-muted">
          {report.votes >= 15 ? 'Confirmed by crowd' : report.votes >= 8 ? 'Gaining confirmation' : ''}
        </span>
      </div>
    </li>
  );
}

export function ReportsFeed() {
  const [scope, setScope] = useState<Scope>('active');
  const [archiveRange, setArchiveRange] = useState<ArchiveRange>(7);
  const [reports, setReports] = useState<CommuterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    type: CommuterReport['type'];
    targetType: CommuterReport['targetType'];
    targetId: string;
    title: string;
    details: string;
    reporterName: string;
    priceValue: string;
    delayMinutes: string;
    severity: CommuterReport['severity'] | undefined;
  }>({
    type: 'traffic',
    targetType: 'Stop',
    targetId: '',
    title: '',
    details: '',
    reporterName: '',
    priceValue: '',
    delayMinutes: '',
    severity: undefined,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs =
        scope === 'archive' ? `?scope=archive&days=${archiveRange}` : '';
      const res = await fetch(`/api/reports${qs}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('bad payload');
      setReports(data);
    } catch {
      setError('Could not load reports. Is the server running?');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [scope, archiveRange]);

  useEffect(() => {
    load();
  }, [load]);

  /** Most disruptive first — impact is what commuters care about. */
  const sorted = useMemo(
    () =>
      [...reports].sort((a, b) => {
        const da = a.delayMinutes ?? 0;
        const dbb = b.delayMinutes ?? 0;
        if (dbb !== da) return dbb - da;
        return b.votes - a.votes;
      }),
    [reports]
  );

  const totals = useMemo(() => {
    const delays = reports.map((r) => r.delayMinutes ?? 0);
    return {
      count: reports.length,
      worst: delays.length ? Math.max(...delays) : 0,
      avg: delays.length ? Math.round(delays.reduce((s, d) => s + d, 0) / delays.length) : 0,
    };
  }, [reports]);

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
          delayMinutes: form.delayMinutes || undefined,
          severity: form.severity || undefined,
        }),
      });
      const data = await res.json();
      if (data.report) {
        setForm({
          type: 'traffic',
          targetType: 'Stop',
          targetId: '',
          title: '',
          details: '',
          reporterName: '',
          priceValue: '',
          delayMinutes: '',
          severity: undefined,
        });
        if (scope === 'active') {
          setReports((prev) => [data.report, ...prev]);
        } else {
          setScope('active');
        }
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
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  votes: data.votes ?? r.votes,
                  severity: data.severity ?? r.severity,
                  delayMinutes: data.delayMinutes ?? r.delayMinutes,
                }
              : r
          )
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
          <h2 className="card-title">Commuter reports</h2>
          <p className="card-subtitle">
            What riders are seeing right now — sorted by how much delay they cause.
          </p>
        </div>

        <div className="scope-tabs" role="tablist" aria-label="Report scope">
          <button
            type="button"
            role="tab"
            aria-selected={scope === 'active'}
            className={`scope-tab${scope === 'active' ? ' active' : ''}`}
            onClick={() => setScope('active')}
          >
            Live now
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scope === 'archive'}
            className={`scope-tab${scope === 'archive' ? ' active' : ''}`}
            onClick={() => setScope('archive')}
          >
            Reference archive
          </button>
        </div>

        {scope === 'archive' && (
          <div className="archive-range" role="group" aria-label="Archive period">
            <span className="text-sm text-muted">Show reports from the last:</span>
            {([1, 7, 30] as ArchiveRange[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`range-chip${archiveRange === d ? ' active' : ''}`}
                onClick={() => setArchiveRange(d)}
              >
                {d === 1 ? '24 hours' : `${d} days`}
              </button>
            ))}
          </div>
        )}

        {!loading && scope === 'active' && reports.length > 0 && (
          <p className="impact-summary text-sm">
            <strong>{totals.count}</strong> active report{totals.count !== 1 ? 's' : ''} ·
            worst estimated delay <strong>{totals.worst} min</strong> ·
            average <strong>{totals.avg} min</strong>
          </p>
        )}

        {loading ? (
          <p className="text-muted">Loading reports…</p>
        ) : error ? (
          <p className="text-error" role="alert">{error}</p>
        ) : sorted.length === 0 ? (
          <p className="text-muted">
            {scope === 'active'
              ? 'No active disruptions — roads are running clean. 🎉'
              : 'No archived reports in this period.'}
          </p>
        ) : (
          <ul className="report-list" role="list">
            {sorted.map((report) => (
              <ReportCard key={report.id} report={report} onVote={vote} compact={scope === 'archive'} />
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Share an update</h3>
          <p className="card-subtitle">
            Report what you see — include the delay so others can judge the impact.
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
              <option value="traffic">Traffic</option>
              <option value="condition">Condition</option>
              <option value="price">Price update</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="rep-target-type">Where?</label>
            <select
              id="rep-target-type"
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value as CommuterReport['targetType'] })}
            >
              <option value="Stop">At a stop</option>
              <option value="Route">On a route leg</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="rep-target">{form.targetType === 'Stop' ? 'Stop' : 'From stop'}</label>
            <select
              id="rep-target"
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            >
              <option value="">Select stop...</option>
              {STOP_IDS.map((id) => (
                <option key={id} value={id}>
                  {STOP_NAMES[id]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rep-delay">How long is the delay? (mins)</label>
            <input
              id="rep-delay"
              type="number"
              min={0}
              value={form.delayMinutes}
              onChange={(e) => setForm({ ...form, delayMinutes: e.target.value })}
              placeholder="e.g. 15"
            />
          </div>
          <div className="field field-full">
            <label htmlFor="rep-title">Short title</label>
            <input
              id="rep-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Gridlock at Ubungo underpass"
            />
          </div>
          <div className="field field-full">
            <label htmlFor="rep-details">What's happening?</label>
            <textarea
              id="rep-details"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Describe the delay, fare change, or road condition..."
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
          {form.type === 'price' && (
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
                <option value="">Auto (from delay)</option>
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

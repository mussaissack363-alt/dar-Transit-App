/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */import React, { useState } from 'react';
import { RoutePlanner } from './components/RoutePlanner';
import { ReportsFeed } from './components/ReportsFeed';
import { Assistant } from './components/Assistant';
import { TrafficBulletin } from './components/TrafficBulletin';
import { AutoTrafficBulletin } from './components/AutoTrafficBulletin';
export function App() {
  const [page, setPage] = useState<'plan' | 'reports' | 'assistant' | 'bulletin' | 'auto-bulletin'>('plan');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <h1>Dar es Salaam Transit Companion</h1>
          <p>Mwendokasi wa DART na daladala — usafiri salama</p>
        </div>
        <nav className="app-nav" aria-label="Main navigation">
          <button
            className={`nav-pill${page === 'plan' ? ' active' : ''}`}
            tabIndex={0}
            onClick={() => setPage('plan')}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
              <path d="M3 12h1m16 0h1M12 3v1m0 16v1" />
              <path d="M12 3a9 9 0 0 1 9 9" />
              <path d="M12 12l-4-4" />
              <path d="M12 12l4-4" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            Route Planner
          </button>
          <button
            className={`nav-pill${page === 'reports' ? ' active' : ''}`}
            tabIndex={0}
            onClick={() => setPage('reports')}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Commuter Reports
          </button>
          <button
            className={`nav-pill${page === 'bulletin' ? ' active' : ''}`}
            tabIndex={0}
            onClick={() => setPage('bulletin')}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Traffic Bulletin
          </button>
          <button
            className={`nav-pill${page === 'auto-bulletin' ? ' active' : ''}`}
            tabIndex={0}
            onClick={() => setPage('auto-bulletin')}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
              <path d="M12 20h.01" />
              <path d="M19 8h-4v8H3v-4H7" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Auto Traffic Updates
          </button>
          <button
            className={`nav-pill${page === 'assistant' ? ' active' : ''}`}
            tabIndex={0}
            onClick={() => setPage('assistant')}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
              <path d="M12 21s-7-5.5-7-11.8A7 7 0 0 1 12 3a7 7 0 0 1 7 7.2c0 6.3-7 11.8-7 11.8z" />
              <path d="M9 15l2 2 4-4" />
            </svg>
            Transit Assistant
          </button>
        </nav>
      </header>

      <main className="app-main">
        {page === 'plan' && <RoutePlanner />}
        {page === 'reports' && <ReportsFeed />}
        {page === 'bulletin' && <TrafficBulletin />}
        {page === 'auto-bulletin' && <AutoTrafficBulletin />}
        {page === 'assistant' && <Assistant />}
      </main>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function Assistant() {
  const [history, setHistory] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [routeContext, setRouteContext] = useState<Record<string, unknown> | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, routeContext]);

  const send = async (text: string) => {
    if (!text.trim() || status === 'sending') return;

    setStatus('sending');
    const userMessage: Message = { role: 'user', text: text.trim() };
    setHistory((prev) => [...prev, userMessage]);
    setMessage('');

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          routeDetails: routeContext
            ? {
                start: routeContext.start as string,
                end: routeContext.end as string,
                scenario: routeContext.scenario as string,
                duration: routeContext.duration as number,
                cost: routeContext.cost as number,
                distance: routeContext.distance as number,
                legs: routeContext.legs as Array<Record<string, unknown>>,
              }
            : undefined,
        }),
      });
      if (!res.ok) {
        setStatus('error');
        setHistory((prev) => [
          ...prev,
          {
            role: 'model',
            text: 'Assistant service unavailable right now. Try again in a moment.',
          },
        ]);
        return;
      }
      const data = await res.json();
      setHistory((prev) => [...prev, { role: 'model', text: data.text ?? '' }]);
    } catch {
      setStatus('error');
      setHistory((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Network error while contacting the assistant.',
        },
      ]);
    } finally {
      setStatus('idle');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send(message);
    }
  };

  return (
    <section className="dashboard-section">
      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Dar Transit Assistant</h2>
          <p className="card-subtitle">
            Ask in Swahili or English about DART, daladala routes, fares, terminals, and travel rules.
          </p>
        </div>

        <div className="assistant-meta-row">
          <span className="text-sm text-muted">Optional route context</span>
          <label className="switch">
            <input
              type="checkbox"
              aria-pressed="false"
              onChange={() =>
                setRouteContext((prev) =>
                  prev
                    ? null
                    : {
                        start: 'morocco',
                        end: 'kivukoni',
                        scenario: 'normal',
                        duration: 23,
                        cost: 900,
                        distance: 12,
                        legs: [
                          { from: 'morocco', to: 'kariakoo_gerezani', mode: 'DART M1', durationMinutes: 7, priceTzs: 400 },
                          { from: 'kariakoo_gerezani', to: 'mlelani', mode: 'Daladala quickline', durationMinutes: 12, priceTzs: 500 },
                          { from: 'mlelani', to: 'kivukoni', mode: 'DAR ferry shuttle', durationMinutes: 15, priceTzs: 600 },
                        ],
                      }
                )
              }
            />
            <span className="switch-track" />
            <span className="switch-label">Attach last planned route</span>
          </label>
        </div>

        <div className="message-list" ref={listRef} aria-live="polite">
          {history.map((entry, idx) => (
            <div key={idx} className={`message ${entry.role}`}>
              <p className="message-text">{entry.text}</p>
            </div>
          ))}
          {history.length === 0 && (
            <p className="empty-chat">No messages yet. Ask about bus routes, fares, or road conditions.</p>
          )}
        </div>

        <div className="chat-input-row">
          <textarea
            className="chat-input"
            placeholder="Shawishi? / How do I get to Kivukoni?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={status === 'sending'}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => send(message)}
            disabled={status === 'sending' || !message.trim()}
          >
            {status === 'sending' ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </section>
  );
}


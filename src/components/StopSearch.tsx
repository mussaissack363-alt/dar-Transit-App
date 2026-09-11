/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface StopOption {
  id: string;
  name: string;
}

interface StopSearchProps {
  id: string;
  label: string;
  options: StopOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

/**
 * Type-to-filter stop selector. Falls back to a plain dropdown when the
 * user prefers clicking; typing narrows the list live.
 */
export function StopSearch({ id, label, options, value, onChange, placeholder }: StopSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q) || o.id.includes(q));
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const pick = (opt: StopOption) => {
    onChange(opt.id);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="stop-search" ref={wrapRef}>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          autoComplete="off"
          value={open ? query : selected?.name ?? ''}
          placeholder={placeholder ?? 'Type to search stops…'}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Enter' && open && matches.length > 0) {
              e.preventDefault();
              pick(matches[0]);
            }
          }}
        />
        {selected && !open && (
          <button
            type="button"
            className="stop-search-clear"
            aria-label="Clear selection"
            onClick={() => onChange('')}
          >
            ×
          </button>
        )}
        {open && (
          <ul className="stop-search-list" id={`${id}-listbox`} role="listbox">
            {matches.length === 0 ? (
              <li className="stop-search-empty" role="option" aria-selected={false}>
                No stops match “{query}”
              </li>
            ) : (
              matches.map((opt) => (
                <li key={opt.id} role="option" aria-selected={opt.id === value}>
                  <button
                    type="button"
                    className={`stop-search-item${opt.id === value ? ' active' : ''}`}
                    onClick={() => pick(opt)}
                  >
                    {opt.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

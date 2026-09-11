/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { STOP_COORDS, STOP_NAMES } from '../utils/dijkstra';

interface StopHit {
  kind: 'stop';
  id: string;
  name: string;
  lat: number;
  long: number;
}

interface PlaceHit {
  kind: 'place';
  id: string;
  name: string;
  lat: number;
  long: number;
}

type SearchHit = StopHit | PlaceHit;

/** Free OSM geocoder — no API key required. */
async function geocode(query: string, signal: AbortSignal): Promise<PlaceHit[]> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5' +
    '&viewbox=39.15,-6.95,39.45,-6.65&bounded=1' +
    '&q=' +
    encodeURIComponent(query + ', Dar es Salaam, Tanzania');
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('geocode failed');
  const data = (await res.json()) as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
  }>;
  return data.map((d) => ({
    kind: 'place' as const,
    id: `place-${d.place_id}`,
    name: d.display_name.split(',').slice(0, 3).join(', '),
    lat: Number(d.lat),
    long: Number(d.lon),
  }));
}

export function MapSearch() {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stopHits, setStopHits] = useState<StopHit[]>([]);
  const [placeHits, setPlaceHits] = useState<PlaceHit[]>([]);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const allStops = useMemo<StopHit[]>(
    () =>
      Object.entries(STOP_COORDS).map(([id, s]) => ({
        kind: 'stop' as const,
        id,
        name: STOP_NAMES[id] ?? id,
        lat: s.lat,
        long: s.long,
      })),
    []
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  /** Local stops filter instantly; places debounce through Nominatim. */
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setStopHits([]);
      setPlaceHits([]);
      setBusy(false);
      return;
    }
    setStopHits(
      allStops.filter((s) => s.name.toLowerCase().includes(q) || s.id.includes(q)).slice(0, 6)
    );

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        const hits = await geocode(query.trim(), controller.signal);
        if (!controller.signal.aborted) setPlaceHits(hits);
      } catch {
        if (!controller.signal.aborted) setPlaceHits([]);
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [query, allStops]);

  /** Pan/zoom to a hit and drop a temporary pin for places. */
  const go = (hit: SearchHit) => {
    map.flyTo([hit.lat, hit.long], hit.kind === 'stop' ? 15 : 16, { duration: 0.8 });
    setOpen(false);
    setQuery(hit.name);
    if (marker) {
      marker.remove();
      setMarker(null);
    }
    if (hit.kind === 'place') {
      const m = L.marker([hit.lat, hit.long]).addTo(map);
      m.bindPopup(hit.name).openPopup();
      setMarker(m);
    }
  };

  const hasResults = stopHits.length > 0 || placeHits.length > 0;

  return (
    <div className="map-search" ref={wrapRef}>
      <div className="map-search-box">
        <input
          type="text"
          placeholder="Search map… stops, streets, landmarks"
          aria-label="Search the map"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
            const first = stopHits[0] ?? placeHits[0];
            if (e.key === 'Enter' && open && first) go(first);
          }}
        />
        {busy && <span className="map-search-spinner" aria-hidden="true" />}
      </div>

      {open && query.trim() && (
        <div className="map-search-panel" role="listbox">
          {stopHits.length > 0 && (
            <>
              <p className="map-search-group">Transit stops</p>
              {stopHits.map((s) => (
                <button key={s.id} type="button" className="map-search-item" onClick={() => go(s)}>
                  <span className="map-search-dot" aria-hidden="true" />
                  {s.name}
                </button>
              ))}
            </>
          )}
          {placeHits.length > 0 && (
            <>
              <p className="map-search-group">Places in Dar</p>
              {placeHits.map((p) => (
                <button key={p.id} type="button" className="map-search-item" onClick={() => go(p)}>
                  <span className="map-search-pin" aria-hidden="true">
                    📍
                  </span>
                  {p.name}
                </button>
              ))}
            </>
          )}
          {!hasResults && !busy && (
            <p className="map-search-item map-search-empty">No matches found</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { STOP_COORDS, STOP_NAMES } from '../utils/dijkstra';
import { DAR_AREAS, DarArea } from '../data/darAreas';

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

interface AreaHit {
  kind: 'area';
  id: string;
  name: string;
  lat: number;
  long: number;
  district: string;
}

type SearchHit = StopHit | AreaHit | PlaceHit;

export interface NearestStop {
  id: string;
  name: string;
  distanceKm: number;
}

export interface MapSearchHandlers {
  onUseAsStart?: (stop: NearestStop) => void;
  onUseAsEnd?: (stop: NearestStop) => void;
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestStops(lat: number, long: number, count = 3): NearestStop[] {
  return Object.entries(STOP_COORDS)
    .map(([id, s]) => ({
      id,
      name: STOP_NAMES[id] ?? id,
      distanceKm: haversineKm(lat, long, s.lat, s.long),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Free OSM geocoder — worldwide, with Dar es Salaam results ranked first. */
async function geocode(query: string, signal: AbortSignal): Promise<PlaceHit[]> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5' +
    // viewbox biases ranking toward Dar without excluding anywhere else
    '&viewbox=39.0,-7.1,39.6,-6.55' +
    '&q=' +
    encodeURIComponent(query);
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

/** Secondary geocoder used when Nominatim returns nothing. */
async function geocodePhoton(query: string, signal: AbortSignal): Promise<PlaceHit[]> {
  const url =
    'https://photon.komoot.io/api/?limit=5' +
    '&bbox=38.9,-7.2,39.7,-6.5' +
    '&q=' +
    encodeURIComponent(query);
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('photon failed');
  const data = (await res.json()) as {
    features: Array<{
      properties: { osm_id: number; name: string; city?: string; district?: string; suburb?: string };
      geometry: { coordinates: [number, number] };
    }>;
  };
  return data.features
    .filter((f) => f.properties.name)
    .map((f) => ({
      kind: 'place' as const,
      id: `photon-${f.properties.osm_id}`,
      name: [f.properties.name, f.properties.district ?? f.properties.suburb, f.properties.city]
        .filter(Boolean)
        .slice(0, 3)
        .join(', '),
      lat: f.geometry.coordinates[1],
      long: f.geometry.coordinates[0],
    }));
}

export function MapSearch({ onUseAsStart, onUseAsEnd }: MapSearchHandlers) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stopHits, setStopHits] = useState<StopHit[]>([]);
  const [areaHits, setAreaHits] = useState<AreaHit[]>([]);
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
      setAreaHits([]);
      setPlaceHits([]);
      setBusy(false);
      return;
    }
    setStopHits(
      allStops.filter((s) => s.name.toLowerCase().includes(q) || s.id.includes(q)).slice(0, 6)
    );

    // Curated Dar areas match instantly and offline.
    const areaQuery = q.replace(/^dar es salaam[, ]*/i, '');
    setAreaHits(
      DAR_AREAS.filter((a) => a.name.toLowerCase().includes(areaQuery))
        .slice(0, 8)
        .map((a) => ({
          kind: 'area' as const,
          id: `area-${a.name.toLowerCase().replace(/\W+/g, '-')}`,
          name: a.district === 'Landmark' ? a.name : `${a.name} (${a.district})`,
          lat: a.lat,
          long: a.long,
          district: a.district,
        }))
    );

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        let hits = await geocode(query.trim(), controller.signal);
        if (hits.length === 0) {
          hits = await geocodePhoton(query.trim(), controller.signal);
        }
        if (!controller.signal.aborted) setPlaceHits(hits);
      } catch {
        if (!controller.signal.aborted) setPlaceHits([]);
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [query, allStops]);

  /** Pan/zoom to a hit; areas and places get a pin popup with nearest stops + plan buttons. */
  const go = (hit: SearchHit) => {
    map.flyTo([hit.lat, hit.long], hit.kind === 'stop' ? 15 : 16, { duration: 0.8 });
    setOpen(false);
    setQuery(hit.name);
    if (marker) {
      marker.remove();
      setMarker(null);
    }
    if (hit.kind !== 'stop') {
      const m = L.marker([hit.lat, hit.long]).addTo(map);
      const nearest = nearestStops(hit.lat, hit.long);
      const div = document.createElement('div');
      div.innerHTML =
        `<strong>${escapeHtml(hit.name)}</strong>` +
        `<div class="map-nearest-title">Nearest transit stops</div>` +
        nearest
          .map(
            (n) =>
              `<div class="map-nearest-stop">${escapeHtml(n.name)} · ${n.distanceKm.toFixed(1)} km</div>`
          )
          .join('') +
        (nearest[0]
          ? `<div class="map-nearest-actions">` +
            `<button type="button" class="map-nearest-btn" data-act="from">Plan from ${escapeHtml(nearest[0].name)}</button>` +
            `<button type="button" class="map-nearest-btn" data-act="to">Plan to ${escapeHtml(nearest[0].name)}</button>` +
            `</div>`
          : '');
      if (nearest[0]) {
        div.querySelector('[data-act="from"]')?.addEventListener('click', () => {
          onUseAsStart?.(nearest[0]);
          m.closePopup();
        });
        div.querySelector('[data-act="to"]')?.addEventListener('click', () => {
          onUseAsEnd?.(nearest[0]);
          m.closePopup();
        });
      }
      m.bindPopup(div, { minWidth: 230 }).openPopup();
      setMarker(m);
    }
  };

  const hasResults = stopHits.length > 0 || areaHits.length > 0 || placeHits.length > 0;

  return (
    <div className="map-search" ref={wrapRef}>
      <div className="map-search-box">
        <input
          type="text"
          placeholder="Search any place… worldwide"
          aria-label="Search the map"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
            const first = stopHits[0] ?? areaHits[0] ?? placeHits[0];
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
          {areaHits.length > 0 && (
            <>
              <p className="map-search-group">Dar es Salaam areas</p>
              {areaHits.map((a) => (
                <button key={a.id} type="button" className="map-search-item" onClick={() => go(a)}>
                  <span className="map-search-area" aria-hidden="true">
                    🏘️
                  </span>
                  {a.name}
                </button>
              ))}
            </>
          )}
          {placeHits.length > 0 && (
            <>
              <p className="map-search-group">Places worldwide</p>
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { STOP_COORDS } from '../utils/dijkstra';
import { TransitRouteResult } from '../types';
import { MapSearch, MapSearchHandlers, NearestStop } from './MapSearch';
import 'leaflet/dist/leaflet.css';

/** Colorful circle markers so we do not depend on Leaflet's default PNG pins. */
function stopIcon(color: string) {
  return L.divIcon({
    className: 'route-map-dot',
    html: `<span style="background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

const START_ICON = stopIcon('oklch(0.62 0.19 145)');
const END_ICON = stopIcon('oklch(0.6 0.2 25)');
const PLAIN_ICON = stopIcon('oklch(0.55 0.14 235)');

/** Re-center the map when the planned route changes. */
function FitBounds({ route }: { route: TransitRouteResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (route && route.legs.length > 0) {
      const points = [route.start, ...route.legs.map((l) => l.to)]
        .map((id) => STOP_COORDS[id])
        .filter(Boolean);
      if (points.length > 1) {
        map.fitBounds(
          L.latLngBounds(points.map((p) => [p.lat, p.long] as [number, number])),
          { padding: [40, 40] }
        );
      }
    }
  }, [route, map]);
  return null;
}

interface RouteMapProps {
  route: TransitRouteResult | null;
  startStopId: string;
  endStopId: string;
  onUseAsStart?: (stop: NearestStop) => void;
  onUseAsEnd?: (stop: NearestStop) => void;
}

export function RouteMap({ route, startStopId, endStopId, onUseAsStart, onUseAsEnd }: RouteMapProps) {
  const routePoints = useMemo(() => {
    if (!route) return [];
    return [route.start, ...route.legs.map((l) => l.to)]
      .map((id) => STOP_COORDS[id])
      .filter(Boolean)
      .map((p) => [p.lat, p.long] as [number, number]);
  }, [route]);

  return (
    <div className="route-map-wrap">
      <MapContainer
        center={[-6.79, 39.26]}
        zoom={12}
        scrollWheelZoom={false}
        className="route-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.entries(STOP_COORDS).map(([id, stop]) => {
          const isStart = id === (route?.start ?? startStopId);
          const isEnd = id === (route?.end ?? endStopId);
          return (
            <Marker key={id} position={[stop.lat, stop.long]} icon={isStart ? START_ICON : isEnd ? END_ICON : PLAIN_ICON}>
              <Popup>{stop.name}</Popup>
            </Marker>
          );
        })}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: 'oklch(0.55 0.14 235)', weight: 5, opacity: 0.85 }}
          />
        )}
        <FitBounds route={route} />
        <MapSearch onUseAsStart={onUseAsStart} onUseAsEnd={onUseAsEnd} />
      </MapContainer>
      <p className="route-map-caption">
        Live map &amp; search &copy; OpenStreetMap contributors — 25 stops across Dar es Salaam.
      </p>
    </div>
  );
}

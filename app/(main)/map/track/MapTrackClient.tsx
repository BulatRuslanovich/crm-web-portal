'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  LayersControl,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';
import type { TrackedActiv } from './MapTrackPage';

const MARKER_COLOR = '#0d9488';
const LINE_COLOR = '#0d9488';
const JITTER_DEG = 0.00005;

function makeNumberedIcon(n: number): L.DivIcon {
  const html = `
    <div style="
      display:flex;align-items:center;justify-content:center;
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      background:${MARKER_COLOR};color:#fff;font-weight:700;font-size:12px;
      transform:rotate(-45deg);border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.3);
    ">
      <span style="transform:rotate(45deg);">${n}</span>
    </div>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const lastKey = useRef<string>('');
  useEffect(() => {
    if (positions.length === 0) return;
    const key = positions.map(([la, lo]) => `${la.toFixed(5)}:${lo.toFixed(5)}`).join('|');
    if (key === lastKey.current) return;
    lastKey.current = key;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 15 });
  }, [positions, map]);
  return null;
}

interface DisplayPoint extends TrackedActiv {
  displayLat: number;
  displayLng: number;
  index: number;
}

function applyJitter(points: TrackedActiv[]): DisplayPoint[] {
  const seen = new Map<string, number>();
  return points.map((p, i) => {
    const key = `${p.latitude.toFixed(6)}:${p.longitude.toFixed(6)}`;
    const occ = seen.get(key) ?? 0;
    seen.set(key, occ + 1);
    if (occ === 0) {
      return { ...p, displayLat: p.latitude, displayLng: p.longitude, index: i + 1 };
    }
    const angle = (occ * Math.PI * 2) / 6;
    return {
      ...p,
      displayLat: p.latitude + Math.cos(angle) * JITTER_DEG * (1 + Math.floor(occ / 6)),
      displayLng: p.longitude + Math.sin(angle) * JITTER_DEG * (1 + Math.floor(occ / 6)),
      index: i + 1,
    };
  });
}

interface Props {
  points: TrackedActiv[];
}

export default function MapTrackClient({ points }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const display = useMemo(() => applyJitter(points), [points]);
  const polyline = useMemo<[number, number][]>(
    () => display.map((p) => [p.displayLat, p.displayLng]),
    [display],
  );

  const center: [number, number] =
    display.length > 0 ? [display[0].displayLat, display[0].displayLng] : [55.751244, 37.618423];

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="Карта" checked={!isDark}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Тёмная" checked={isDark}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Спутник">
          <TileLayer
            attribution="&copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <FitBounds positions={polyline} />

      {polyline.length > 1 && (
        <Polyline
          positions={polyline}
          pathOptions={{ color: LINE_COLOR, weight: 3, opacity: 0.7 }}
        />
      )}

      {display.map((p) => (
        <Marker
          key={p.activId}
          position={[p.displayLat, p.displayLng]}
          icon={makeNumberedIcon(p.index)}
        >
          <Popup maxWidth={280}>
            <PointPopup point={p} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function PointPopup({ point }: { point: DisplayPoint }) {
  const target = point.physName ?? point.orgName ?? '—';
  const endLabel = new Date(point.end).toLocaleString('ru-RU');
  return (
    <div className="min-w-[220px] text-[13px] leading-snug">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold">
          {point.index}
        </span>
        <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          {point.statusName}
        </span>
      </div>
      <div className="text-foreground mb-1 text-sm font-bold">{target}</div>
      <div className="text-muted-foreground mb-1 text-[11px]">{endLabel}</div>
      <div className="text-muted-foreground mb-2 text-[11px]">Сотрудник: {point.usrLogin}</div>
      {point.description && (
        <div className="text-muted-foreground/80 mb-2 line-clamp-3 text-[11px]">
          {point.description}
        </div>
      )}
      <a
        href={`/activs/${point.activId}`}
        className="text-foreground inline-block text-xs font-semibold hover:underline"
      >
        Открыть визит →
      </a>
    </div>
  );
}

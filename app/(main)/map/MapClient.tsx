'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useTheme } from 'next-themes';
import { Locate } from 'lucide-react';
import type { OrgResponse } from '@/lib/api/types';
import { colorForType } from './palette';

/* ── colored DivIcon ────────────────────────────────────────────────────── */
function makeIcon(color: string): L.DivIcon {
  const html = `
    <span style="
      display:block;width:24px;height:24px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);
    ">
      <span style="
        display:block;width:8px;height:8px;border-radius:50%;
        background:#fff;margin:6px auto;transform:rotate(45deg);
      "></span>
    </span>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 22],
    popupAnchor: [0, -20],
  });
}

const iconCache = new Map<string, L.DivIcon>();
function getIcon(color: string) {
  let icon = iconCache.get(color);
  if (!icon) {
    icon = makeIcon(color);
    iconCache.set(color, icon);
  }
  return icon;
}

/* ── cluster icon builder ───────────────────────────────────────────────── */
function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 34 : count < 100 ? 40 : 48;
  const bg = count < 10 ? '#0d9488' : count < 100 ? '#d97706' : '#dc2626';
  return L.divIcon({
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:${size}px;height:${size}px;border-radius:50%;
        background:${bg};color:#fff;font-weight:700;font-size:13px;
        border:3px solid rgba(255,255,255,.9);
        box-shadow:0 2px 8px rgba(0,0,0,.3);
      ">${count}</div>`,
    className: '',
    iconSize: [size, size],
  });
}

/* ── auto-fit bounds when org list changes ──────────────────────────────── */
function FitBounds({ orgs }: { orgs: OrgResponse[] }) {
  const map = useMap();
  const lastKey = useRef<string>('');

  useEffect(() => {
    if (!orgs.length) return;
    const key = orgs.map((o) => o.orgId).join(',');
    if (key === lastKey.current) return;
    lastKey.current = key;

    if (orgs.length === 1) {
      map.setView([orgs[0].latitude, orgs[0].longitude], 13);
      return;
    }
    const bounds = L.latLngBounds(
      orgs.map((o) => [o.latitude, o.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [orgs, map]);

  return null;
}

/* ── fly-to on demand ───────────────────────────────────────────────────── */
function FlyTo({
  target,
  markerRefs,
}: {
  target: OrgResponse | null;
  markerRefs: React.RefObject<Map<number, L.Marker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.latitude, target.longitude], 15, { duration: 0.7 });
    const marker = markerRefs.current.get(target.orgId);
    if (marker) {
      setTimeout(() => marker.openPopup(), 750);
    }
  }, [target, map, markerRefs]);
  return null;
}

/* ── locate me control ──────────────────────────────────────────────────── */
function LocateControl() {
  const map = useMap();
  const [busy, setBusy] = useState(false);

  function locate() {
    if (!('geolocation' in navigator)) return;
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 14);
        setBusy(false);
      },
      () => setBusy(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: 'none' }}>
      <div className="leaflet-control" style={{ pointerEvents: 'auto', marginTop: 64 }}>
        <button
          onClick={locate}
          disabled={busy}
          title="Моё местоположение"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-(--border) bg-(--surface) text-(--fg) shadow-md transition-all hover:bg-(--surface-raised) disabled:opacity-50"
        >
          <Locate size={16} className={busy ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
}

/* ── popup body ─────────────────────────────────────────────────────────── */
function OrgPopup({ org }: { org: OrgResponse }) {
  const color = colorForType(org.orgTypeId);
  return (
    <div className="min-w-[200px] text-[13px] leading-snug">
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: color }}
        />
        <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color }}>
          {org.orgTypeName}
        </span>
      </div>
      <div className="mb-1 text-sm font-bold text-(--fg)">{org.orgName}</div>
      {org.address && (
        <div className="mb-1 text-xs text-(--fg-muted)">{org.address}</div>
      )}
      {org.inn && (
        <div className="mb-2 text-[11px] text-(--fg-subtle)">ИНН: {org.inn}</div>
      )}
      <a
        href={`/orgs/${org.orgId}`}
        className="inline-block text-xs font-semibold text-(--primary-text) hover:underline"
      >
        Открыть →
      </a>
    </div>
  );
}

interface Props {
  orgs: OrgResponse[];
  flyToOrg?: OrgResponse | null;
}

export default function MapClient({ orgs, flyToOrg }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const validOrgs = useMemo(
    () => orgs.filter((o) => o.latitude !== 0 && o.longitude !== 0),
    [orgs],
  );

  const markerRefs = useRef<Map<number, L.Marker>>(new Map());

  const defaultCenter: [number, number] =
    validOrgs.length > 0
      ? [validOrgs[0].latitude, validOrgs[0].longitude]
      : [55.751244, 37.618423];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={10}
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
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <FitBounds orgs={validOrgs} />
      <LocateControl />
      <FlyTo target={flyToOrg ?? null} markerRefs={markerRefs} />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        maxClusterRadius={50}
      >
        {validOrgs.map((org) => (
          <Marker
            key={org.orgId}
            position={[org.latitude, org.longitude]}
            icon={getIcon(colorForType(org.orgTypeId))}
            ref={(m) => {
              if (m) markerRefs.current.set(org.orgId, m);
              else markerRefs.current.delete(org.orgId);
            }}
          >
            <Popup maxWidth={260}>
              <OrgPopup org={org} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

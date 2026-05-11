'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type ymaps from 'yandex-maps';
import { useTheme } from 'next-themes';
import { loadYandexMaps } from '@/lib/yandex-maps-loader';
import type { TrackedActiv } from './MapTrackPage';

const YANDEX_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? '';

const MARKER_COLOR = '#0d9488';
const LINE_COLOR = '#0d9488';
const JITTER_DEG = 0.00005;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

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

function popupHtml(point: DisplayPoint): string {
  const target = point.physName ?? point.orgName ?? '—';
  const endLabel = new Date(point.end).toLocaleString('ru-RU');
  return `
    <div style="min-width:220px;font-size:13px;line-height:1.35;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;border-radius:9999px;background:${MARKER_COLOR};color:#fff;font-weight:700;font-size:10px;padding:0 6px;">${point.index}</span>
        <span style="font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#6b7280;">${escapeHtml(point.statusName)}</span>
      </div>
      <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${escapeHtml(target)}</div>
      <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">${escapeHtml(endLabel)}</div>
      <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">Сотрудник: ${escapeHtml(point.usrLogin)}</div>
      ${point.description ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(point.description)}</div>` : ''}
      <a href="/activs/${point.activId}" style="font-size:12px;font-weight:600;text-decoration:none;color:inherit;">Открыть визит →</a>
    </div>`;
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

  const mapRef = useRef<ymaps.Map | null>(null);
  const ymapsRef = useRef<typeof ymaps | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const polylineRef = useRef<ymaps.Polyline | null>(null);
  const placemarksRef = useRef<ymaps.Placemark[] | null>(null);
  const lastBoundsKey = useRef<string>('');
  const [mapReady, setMapReady] = useState(false);

  const center = useMemo<[number, number]>(
    () => (display.length > 0 ? [display[0].displayLat, display[0].displayLng] : [55.751244, 37.618423]),
    [display],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;

    loadYandexMaps(YANDEX_API_KEY).then((api) => {
      if (disposed || mapRef.current) return;

      ymapsRef.current = api;
      const map = new api.Map(container, {
        center,
        zoom: 11,
        controls: [],
        type: isDark ? 'yandex#hybrid' : 'yandex#map',
      }, {
        suppressMapOpenBlock: true,
      });
      map.controls.add(new api.control.ZoomControl({ options: { position: { right: 10, top: 10 } } }));
      const typeSelector = new api.control.TypeSelector({ options: { panoramasItemMode: 'off' } });
      map.controls.add(typeSelector, { position: { right: 10, top: 110 } });

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      disposed = true;
      setMapReady(false);
      polylineRef.current = null;
      placemarksRef.current = null;
      ymapsRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [center, isDark]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setType(isDark ? 'yandex#hybrid' : 'yandex#map');
  }, [isDark]);

  useEffect(() => {
    const ym = ymapsRef.current;
    const map = mapRef.current;
    if (!ym || !map) return;

    if (polylineRef.current) {
      map.geoObjects.remove(polylineRef.current);
      polylineRef.current = null;
    }
    placemarksRef.current?.forEach((placemark) => map.geoObjects.remove(placemark));

    if (polyline.length > 1) {
      const line = new ym.Polyline(polyline, {}, { strokeColor: LINE_COLOR, strokeWidth: 3, strokeOpacity: 0.7 });
      map.geoObjects.add(line);
      polylineRef.current = line;
    }

    const placemarks = display.map(
      (p) =>
        new ym.Placemark(
          [p.displayLat, p.displayLng],
          {
            iconContent: String(p.index),
            balloonContentBody: popupHtml(p),
            hintContent: p.physName ?? p.orgName ?? '',
          },
          {
            preset: 'islands#darkGreenStretchyIcon',
            iconColor: MARKER_COLOR,
          },
        ),
    );
    placemarks.forEach((placemark) => map.geoObjects.add(placemark));
    placemarksRef.current = placemarks;
  }, [display, mapReady, polyline]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || polyline.length === 0) return;
    const key = polyline.map(([la, lo]) => `${la.toFixed(5)}:${lo.toFixed(5)}`).join('|');
    if (key === lastBoundsKey.current) return;
    lastBoundsKey.current = key;

    if (polyline.length === 1) {
      map.setCenter(polyline[0], 14);
      return;
    }
    const lats = polyline.map(([la]) => la);
    const lngs = polyline.map(([, lo]) => lo);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    map.setBounds(bounds, { checkZoomRange: true, zoomMargin: [40, 40, 40, 40] }).then(() => {
      if (map.getZoom() > 15) map.setZoom(15);
    });
  }, [mapReady, polyline]);

  return <div ref={containerRef} className="h-full w-full" />;
}

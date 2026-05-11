'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Locate } from 'lucide-react';
import type { OrgResponse } from '@/lib/api/types';
import { loadYandexMaps } from '@/lib/yandex-maps-loader';
import { colorForType } from './palette';
import type { FlyToOrgTarget } from './MapPage';
import type ymaps from 'yandex-maps';

const YANDEX_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? '';
const DEFAULT_CENTER: [number, number] = [55.751244, 37.618423];

function hasValidCoords(org: OrgResponse): boolean {
  return (
    Number.isFinite(org.latitude) &&
    Number.isFinite(org.longitude) &&
    org.latitude !== 0 &&
    org.longitude !== 0 &&
    Math.abs(org.latitude) <= 90 &&
    Math.abs(org.longitude) <= 180
  );
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function popupHtml(org: OrgResponse): string {
  const color = colorForType(org.orgTypeId);
  return `
    <div style="min-width:200px;font-size:13px;line-height:1.35;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
        <span style="font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:${color};">${escapeHtml(org.orgTypeName)}</span>
      </div>
      <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${escapeHtml(org.orgName)}</div>
      ${org.address ? `<div style="font-size:12px;color:#6b7280;margin-bottom:4px;">${escapeHtml(org.address)}</div>` : ''}
      ${org.inn ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:8px;">ИНН: ${escapeHtml(org.inn)}</div>` : ''}
      <a href="/orgs/${org.orgId}" style="font-size:12px;font-weight:600;text-decoration:none;color:inherit;">Открыть →</a>
    </div>`;
}

interface Props {
  orgs: OrgResponse[];
  flyToOrg?: FlyToOrgTarget | null;
  selectedOrgId?: number | null;
}

export default function MapClient({ orgs, flyToOrg, selectedOrgId }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const validOrgs = useMemo(
    () => orgs.filter(hasValidCoords),
    [orgs],
  );

  const mapRef = useRef<ymaps.Map | null>(null);
  const ymapsRef = useRef<typeof ymaps | null>(null);
  const lastBoundsKey = useRef<string>('');
  const [busy, setBusy] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const clustererRef = useRef<ymaps.Clusterer | null>(null);
  const placemarksRef = useRef<Map<number, ymaps.Placemark>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;

    loadYandexMaps(YANDEX_API_KEY).then((api) => {
      if (disposed || mapRef.current) return;

      ymapsRef.current = api;
      const map = new api.Map(container, {
        center: DEFAULT_CENTER,
        zoom: 10,
        controls: [],
        type: 'yandex#map',
      }, {
        suppressMapOpenBlock: true,
      });
      map.controls.add(new api.control.ZoomControl({ options: { position: { right: 10, top: 10 } } }));
      const typeSelector = new api.control.TypeSelector({ options: { panoramasItemMode: 'off' } });
      map.controls.add(typeSelector, { position: { right: 10, top: 110 } });

      const clusterer = new api.Clusterer({
        preset: 'islands#invertedDarkGreenClusterIcons',
        groupByCoordinates: false,
      });
      map.geoObjects.add(clusterer as unknown as ymaps.IGeoObject);

      mapRef.current = map;
      clustererRef.current = clusterer;
      setMapReady(true);
    });

    return () => {
      disposed = true;
      setMapReady(false);
      clustererRef.current = null;
      placemarksRef.current.clear();
      ymapsRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setType(isDark ? 'yandex#hybrid' : 'yandex#map');
  }, [isDark]);

  useEffect(() => {
    const ym = ymapsRef.current;
    const clusterer = clustererRef.current;
    if (!ym || !clusterer) return;

    clusterer.removeAll();
    placemarksRef.current.clear();

    const placemarks = validOrgs.map((org) => {
      const selected = selectedOrgId === org.orgId;
      const placemark = new ym.Placemark(
        [org.latitude, org.longitude],
        {
          balloonContentBody: popupHtml(org),
          hintContent: org.orgName,
        },
        {
          preset: selected ? 'islands#circleIcon' : 'islands#circleDotIcon',
          iconColor: selected ? '#f97316' : colorForType(org.orgTypeId),
          zIndex: selected ? 1000 : undefined,
          zIndexHover: selected ? 1000 : undefined,
          zIndexActive: selected ? 1000 : undefined,
        },
      );

      placemarksRef.current.set(org.orgId, placemark);
      return placemark;
    });

    clusterer.add(
      placemarks,
    );
  }, [mapReady, selectedOrgId, validOrgs]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || validOrgs.length === 0) return;
    const key = validOrgs.map((o) => `${o.orgId}:${o.latitude}:${o.longitude}`).join(',');
    if (key === lastBoundsKey.current) return;
    lastBoundsKey.current = key;

    if (validOrgs.length === 1) {
      map.setCenter([validOrgs[0].latitude, validOrgs[0].longitude], 13);
      return;
    }
    const lats = validOrgs.map((o) => o.latitude);
    const lngs = validOrgs.map((o) => o.longitude);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    map.setBounds(bounds, { checkZoomRange: true, zoomMargin: [40, 40, 40, 40] }).then(() => {
      if (map.getZoom() > 14) map.setZoom(14);
    });
  }, [mapReady, validOrgs]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToOrg) return;
    map.setCenter([flyToOrg.org.latitude, flyToOrg.org.longitude], 15, { duration: 700 }).then(() => {
      placemarksRef.current.get(flyToOrg.org.orgId)?.balloon.open();
    });
  }, [flyToOrg, mapReady, selectedOrgId]);

  const handleLocate = useCallback(() => {
    const map = mapRef.current;
    const ym = ymapsRef.current;
    if (!map || !ym) return;
    setBusy(true);
    ym.geolocation
      .get({ provider: 'browser', mapStateAutoApply: true })
      .then((res) => {
        const geom = res.geoObjects.get(0).geometry as ymaps.geometry.Point | null;
        const pos = geom?.getCoordinates();
        if (pos) map.setCenter(pos, 14);
        setBusy(false);
      }, () => {
        setBusy(false);
      });
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      <button
        onClick={handleLocate}
        disabled={busy}
        title="Моё местоположение"
        className="border-border bg-card text-foreground hover:bg-muted absolute top-[170px] right-[10px] z-[1000] flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border shadow-md transition-all disabled:opacity-50"
      >
        <Locate size={16} className={busy ? 'animate-pulse' : ''} />
      </button>
    </div>
  );
}

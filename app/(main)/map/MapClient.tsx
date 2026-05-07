'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { YMaps, Map as YMap, Placemark, Clusterer, ZoomControl, TypeSelector } from '@pbe/react-yandex-maps';
import { useTheme } from 'next-themes';
import { Locate } from 'lucide-react';
import type { OrgResponse } from '@/lib/api/types';
import { colorForType } from './palette';
import type { FlyToOrgTarget } from './MapPage';
import type ymaps from 'yandex-maps';

const YANDEX_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? '';

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
}

export default function MapClient({ orgs, flyToOrg }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const validOrgs = useMemo(
    () => orgs.filter((o) => o.latitude !== 0 && o.longitude !== 0),
    [orgs],
  );

  const mapRef = useRef<ymaps.Map | null>(null);
  const ymapsRef = useRef<typeof ymaps | null>(null);
  const lastBoundsKey = useRef<string>('');
  const [busy, setBusy] = useState(false);

  const defaultCenter: [number, number] =
    validOrgs.length > 0 ? [validOrgs[0].latitude, validOrgs[0].longitude] : [55.751244, 37.618423];

  useEffect(() => {
    const map = mapRef.current;
    if (!map || validOrgs.length === 0) return;
    const key = validOrgs.map((o) => o.orgId).join(',');
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
  }, [validOrgs]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToOrg) return;
    map.setCenter([flyToOrg.org.latitude, flyToOrg.org.longitude], 15, { duration: 700 });
  }, [flyToOrg]);

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
      })
      .finally(() => setBusy(false));
  }, []);

  const onLoad = useCallback((api: typeof ymaps) => {
    ymapsRef.current = api;
  }, []);

  return (
    <div className="relative h-full w-full">
      <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'ru_RU' }}>
        <YMap
          instanceRef={(ref) => {
            mapRef.current = (ref as ymaps.Map | null) ?? null;
          }}
          onLoad={onLoad}
          defaultState={{
            center: defaultCenter,
            zoom: 10,
            controls: [],
            type: isDark ? 'yandex#hybrid' : 'yandex#map',
          }}
          width="100%"
          height="100%"
          modules={['geolocation', 'geometry.Point']}
        >
          <ZoomControl options={{ position: { right: 10, top: 10 } }} />
          <TypeSelector options={{ position: { right: 10, top: 110 } } as unknown as ymaps.IOptionManager} />

          <Clusterer
            options={{
              preset: 'islands#invertedDarkGreenClusterIcons',
              groupByCoordinates: false,
              clusterDisableClickZoom: false,
            }}
          >
            {validOrgs.map((org) => (
              <Placemark
                key={org.orgId}
                geometry={[org.latitude, org.longitude]}
                properties={{
                  balloonContentBody: popupHtml(org),
                  hintContent: org.orgName,
                }}
                options={{
                  preset: 'islands#circleDotIcon',
                  iconColor: colorForType(org.orgTypeId),
                }}
              />
            ))}
          </Clusterer>
        </YMap>
      </YMaps>

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

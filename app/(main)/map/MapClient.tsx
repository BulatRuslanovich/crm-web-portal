'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OrgResponse } from '@/lib/api/types';

// Fix default Leaflet marker icons broken by webpack
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface Props {
  orgs: OrgResponse[];
}

export default function MapClient({ orgs }: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const validOrgs = orgs.filter(
    (o) => o.latitude !== 0 && o.longitude !== 0,
  );

  // Default center: Russia
  const defaultCenter: [number, number] = validOrgs.length > 0
    ? [validOrgs[0].latitude, validOrgs[0].longitude]
    : [55.751244, 37.618423];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={10}
      style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validOrgs.map((org) => (
        <Marker key={org.orgId} position={[org.latitude, org.longitude]}>
          <Popup maxWidth={240}>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              <strong style={{ display: 'block', marginBottom: '2px' }}>{org.orgName}</strong>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>{org.orgTypeName}</span>
              {org.address && (
                <p style={{ margin: '4px 0 0', color: '#374151', fontSize: '12px' }}>
                  {org.address}
                </p>
              )}
              {org.inn && (
                <p style={{ margin: '2px 0 0', color: '#9ca3af', fontSize: '11px' }}>
                  ИНН: {org.inn}
                </p>
              )}
              <a
                href={`/orgs/${org.orgId}`}
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: '500',
                  textDecoration: 'none',
                }}
              >
                Открыть →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

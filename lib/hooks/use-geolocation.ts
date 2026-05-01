export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type GeoFailureReason =
  | 'unsupported'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unknown';

export class GeolocationError extends Error {
  reason: GeoFailureReason;
  constructor(reason: GeoFailureReason, message?: string) {
    super(message ?? reason);
    this.reason = reason;
  }
}

const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 0,
};

export function getCurrentPosition(options: PositionOptions = DEFAULT_OPTIONS): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new GeolocationError('unsupported', 'Geolocation API недоступен'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        const reason: GeoFailureReason =
          err.code === err.PERMISSION_DENIED
            ? 'permission_denied'
            : err.code === err.POSITION_UNAVAILABLE
              ? 'position_unavailable'
              : err.code === err.TIMEOUT
                ? 'timeout'
                : 'unknown';
        reject(new GeolocationError(reason, err.message));
      },
      options,
    );
  });
}

export function describeGeoFailure(reason: GeoFailureReason): string {
  switch (reason) {
    case 'unsupported':
      return 'Браузер не поддерживает определение координат';
    case 'permission_denied':
      return 'Доступ к геолокации отклонён';
    case 'position_unavailable':
      return 'Не удалось определить координаты';
    case 'timeout':
      return 'Координаты не получены вовремя';
    default:
      return 'Не удалось получить координаты';
  }
}

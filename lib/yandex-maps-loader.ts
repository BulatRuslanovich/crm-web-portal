'use client';

import type ymaps from 'yandex-maps';

const YANDEX_MAPS_SRC = 'https://api-maps.yandex.ru/2.1/';

let loadPromise: Promise<typeof ymaps> | null = null;

declare global {
  interface Window {
    ymaps?: typeof ymaps;
  }
}

export function loadYandexMaps(apiKey: string): Promise<typeof ymaps> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Yandex Maps can only be loaded in a browser'));
  }

  if (window.ymaps) {
    return new Promise((resolve) => {
      window.ymaps!.ready(() => resolve(window.ymaps!));
    });
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const query = new URLSearchParams({ lang: 'ru_RU' });
    if (apiKey) query.set('apikey', apiKey);

    script.src = `${YANDEX_MAPS_SRC}?${query.toString()}`;
    script.async = true;
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error('Yandex Maps API did not initialize'));
        return;
      }

      window.ymaps.ready(() => resolve(window.ymaps!));
    };
    script.onerror = () => reject(new Error('Failed to load Yandex Maps API'));

    document.head.appendChild(script);
  });

  return loadPromise;
}

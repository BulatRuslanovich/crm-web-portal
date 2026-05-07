import type { AxiosRequestConfig } from 'axios';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://192.168.0.23:5000';

export const jsonHeaders = { 'Content-Type': 'application/json' };

export const paramsSerializer: AxiosRequestConfig['paramsSerializer'] = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

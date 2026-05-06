'use client';

import axios from 'axios';
import { BASE_URL, jsonHeaders, paramsSerializer } from './config';

export { BASE_URL } from './config';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: jsonHeaders,
  withCredentials: true,
  timeout: 10000,
  paramsSerializer,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { data } = await axios.post<{ accessToken: string }>(
      `${BASE_URL}/api/auth/refresh`,
      undefined,
      {
        headers: jsonHeaders,
        withCredentials: true,
      },
    );
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch {
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(error);
  },
);

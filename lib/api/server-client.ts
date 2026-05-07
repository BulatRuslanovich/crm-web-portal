import 'server-only';

import axios from 'axios';
import { cookies } from 'next/headers';
import { BASE_URL, jsonHeaders, paramsSerializer } from './config';

export async function createServerApiClient() {
  const cookieStore = await cookies();

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      ...jsonHeaders,
      Cookie: cookieStore.toString(),
    },
    withCredentials: true,
    timeout: 10000,
    paramsSerializer,
  });
}

export async function refreshServerAccessToken() {
  const serverApiClient = await createServerApiClient();
  const { data } = await serverApiClient.post<{ accessToken: string }>('/api/auth/refresh');
  return data.accessToken;
}

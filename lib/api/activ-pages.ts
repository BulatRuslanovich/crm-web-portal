import { activsApi, type ActivsQuery } from './activs';
import type { ActivResponse } from './types';

export const ACTIVS_AGGREGATION_PAGE_SIZE = 500;

export interface ActivsPageLoadResult {
  items: ActivResponse[];
  totalCount: number;
  totalPages: number;
  loadedPages: number;
}

export async function fetchAllActivPages(
  query: Omit<ActivsQuery, 'page' | 'pageSize'>,
  signal?: AbortSignal,
): Promise<ActivsPageLoadResult> {
  const firstPage = await activsApi.getAll(
    { ...query, page: 1, pageSize: ACTIVS_AGGREGATION_PAGE_SIZE },
    { signal },
  );

  const totalPages = firstPage.data.totalPages;
  const items = [...firstPage.data.items];

  for (let page = 2; page <= totalPages; page += 1) {
    signal?.throwIfAborted();
    const response = await activsApi.getAll(
      { ...query, page, pageSize: ACTIVS_AGGREGATION_PAGE_SIZE },
      { signal },
    );
    items.push(...response.data.items);
  }

  return {
    items,
    totalCount: firstPage.data.totalCount,
    totalPages,
    loadedPages: totalPages,
  };
}

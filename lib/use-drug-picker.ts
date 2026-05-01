'use client';

import { ActivResponse } from '@/lib/api/types';
import { useMultiPicker } from '@/lib/hooks/use-multi-picker';
import { useMemo } from 'react';

export function useDrugPicker(activ: ActivResponse | undefined) {
  return useMultiPicker(
    useMemo(
      () =>
        activ
          ? activ.drugs.map((d) => ({
              id: d.drugId,
              option: {
                value: String(d.drugId),
                label: d.drugName,
                sublabel: d.brand,
              },
            }))
          : [],
      [activ],
    ),
  );
}

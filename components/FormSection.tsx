'use client';

import { SectionLabel } from '@/components/ui';
import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

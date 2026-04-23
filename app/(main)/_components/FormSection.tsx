'use client';

import { LucideIcon } from 'lucide-react';
import { SectionLabel } from '@/components/ui';
import React from 'react';


interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

export function FormSection({ icon, title, children }: FormSectionProps) {
  return (
    <div>
      <SectionLabel icon={icon}>{title}</SectionLabel>
      <div className="space-y-4">{children}</div>
    </div>
  );
}


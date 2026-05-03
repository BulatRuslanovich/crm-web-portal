import { toneClass, type Tone } from '@/lib/tone';
import React from 'react';

export function ToneIcon({
  icon: Icon,
  tone = 'default',
  size = 'md',
  solid = false,
}: {
  icon: React.ElementType;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  solid?: boolean;
}) {
  const box = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-11 w-11' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 20 : 16;
  const ring = solid ? '' : 'ring-1';
  return (
    <div
      className={`flex items-center justify-center rounded-xl ${ring} ${box} ${toneClass(tone, solid)}`}
    >
      <Icon size={iconSize} />
    </div>
  );
}

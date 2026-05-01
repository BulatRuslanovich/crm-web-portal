import { toneClass, type Tone } from '@/lib/tone';
import React from 'react';

export function ToneIcon({
  icon: Icon,
  tone = 'default',
  size = 'md',
}: {
  icon: React.ElementType;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
}) {
  const box = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-11 w-11' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 18 : 16;
  return (
    <div className={`flex items-center justify-center rounded-xl ring-1 ${box} ${toneClass(tone)}`}>
      <Icon size={iconSize} />
    </div>
  );
}

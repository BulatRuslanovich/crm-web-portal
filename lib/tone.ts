export type Tone = 'primary' | 'success' | 'warning' | 'violet' | 'sky' | 'default';

const SOFT: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary ring-primary/15',
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-warning/15 text-warning ring-warning/25',
  violet: 'bg-violet-500/10 text-violet-500 ring-violet-500/20',
  sky: 'bg-sky-500/10 text-sky-500 ring-sky-500/20',
  default: 'bg-muted text-muted-foreground ring-border',
};

const SOLID: Record<Tone, string> = {
  primary: 'bg-primary text-primary-foreground shadow-md shadow-primary/25',
  success: 'bg-success text-success-foreground shadow-md shadow-success/25',
  warning: 'bg-warning text-warning-foreground shadow-md shadow-warning/25',
  violet: 'bg-violet-500 text-white shadow-md shadow-violet-500/30',
  sky: 'bg-sky-500 text-white shadow-md shadow-sky-500/30',
  default: 'bg-muted-foreground text-background',
};

export function toneClass(tone: Tone = 'default', solid = false): string {
  return (solid ? SOLID : SOFT)[tone];
}

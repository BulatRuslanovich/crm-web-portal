export type Tone = 'primary' | 'success' | 'warning' | 'default';

const TONE_CLASSES: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary ring-primary/15',
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-warning/15 text-warning ring-warning/25',
  default: 'bg-muted text-muted-foreground ring-border',
};

export function toneClass(tone: Tone = 'default'): string {
  return TONE_CLASSES[tone];
}

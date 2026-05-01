export const HOUR_HEIGHT = 48;
export const TOTAL_HEIGHT = HOUR_HEIGHT * 24;
export const DEFAULT_DURATION_MIN = 15;
const MIN_EVENT_HEIGHT = 22;

// Minimum visual footprint in minutes — keeps layout & render in sync
// so tiny/zero-duration events don't visually overlap while algorithm thinks they don't.
export const MIN_EVENT_MINUTES = Math.ceil((MIN_EVENT_HEIGHT / HOUR_HEIGHT) * 60);

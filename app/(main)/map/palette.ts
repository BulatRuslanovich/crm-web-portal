const TYPE_PALETTE = [
  '#0d9488', '#d97706', '#0369a1', '#059669', '#7c3aed',
  '#db2777', '#dc2626', '#65a30d', '#0891b2', '#9333ea',
];

export function colorForType(typeId: number): string {
  return TYPE_PALETTE[typeId % TYPE_PALETTE.length];
}

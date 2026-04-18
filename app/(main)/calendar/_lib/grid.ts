import { daysInMonth, monBasedDow } from '../../_lib/date';

export interface GridCell {
  date: Date;
  outOfMonth: boolean;
}

export function buildGrid(year: number, month: number): GridCell[] {
  const total = daysInMonth(year, month);
  const firstDow = monBasedDow(new Date(year, month, 1));
  const cells: GridCell[] = [];

  for (let i = firstDow; i > 0; i--) {
    cells.push({ date: new Date(year, month, 1 - i), outOfMonth: true });
  }
  for (let d = 1; d <= total; d++) {
    cells.push({ date: new Date(year, month, d), outOfMonth: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      outOfMonth: true,
    });
  }
  return cells;
}

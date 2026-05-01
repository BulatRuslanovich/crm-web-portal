import type { LucideIcon } from 'lucide-react';
import { SectionLabel } from '@/components/ui';

interface Item {
  key: number | string;
  label: string;
}

interface Props {
  icon: LucideIcon;
  title: string;
  items: Item[];
}

export function ChipListSection({ icon: Icon, title, items }: Props) {
  return (
    <>
      <hr className="border-border" />
      <div>
        <SectionLabel icon={Icon}>
          {title} <span className="ml-1 text-muted-foreground/60">· {items.length}</span>
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground"
            >
              <Icon size={11} className="text-muted-foreground" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

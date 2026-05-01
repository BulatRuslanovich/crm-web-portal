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
          {title} <span className="text-muted-foreground/60 ml-1">· {items.length}</span>
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.key}
              className="border-border bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
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

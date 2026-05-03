import { SectionLabel } from '@/components/ui';

interface Item {
  key: number | string;
  label: string;
}

interface Props {
  title: string;
  items: Item[];
}

export function ChipListSection({ title, items }: Props) {
  return (
    <>
      <hr className="border-border" />
      <div>
        <SectionLabel>
          {title} <span className="text-muted-foreground/60 ml-1">· {items.length}</span>
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.key}
              className="border-border bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

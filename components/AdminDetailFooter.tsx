'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { BtnDanger, BtnSecondary, CardFooter } from '@/components/ui';

interface Props {
  show: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

export function AdminDetailFooter({ show, onDelete, onEdit }: Props) {
  if (!show) return null;
  return (
    <CardFooter>
      <div className="flex-1">
        <BtnDanger onClick={onDelete}>
          <Trash2 size={14} /> Удалить
        </BtnDanger>
      </div>
      <BtnSecondary onClick={onEdit}>
        <Pencil size={14} /> Редактировать
      </BtnSecondary>
    </CardFooter>
  );
}

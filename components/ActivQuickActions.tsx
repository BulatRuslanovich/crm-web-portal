'use client';

import { Ban, Pencil, Play, Save, Sticker, Trash2 } from 'lucide-react';
import { BtnDanger, BtnPrimary, BtnSecondary } from '@/components/ui';
import { FINAL_STATUSES, STATUS_OPEN, STATUS_PLANNED } from '@/lib/api/statuses';

interface Props {
  statusId: number;
  acting: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isLocked: boolean;
  onOpen: () => void;
  onSave: () => void;
  onClose: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ActivQuickActions(props: Props) {
  const { statusId, acting, canEdit, canDelete, isLocked, onCancel, onDelete, onEdit } = props;
  const canCancel = !isLocked && !FINAL_STATUSES.has(statusId);

  return (
    <>
      <div className="flex-1">
        {canDelete && (
          <BtnDanger onClick={onDelete}>
            <Trash2 size={14} /> Удалить
          </BtnDanger>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!isLocked && statusId === STATUS_PLANNED && (
          <BtnPrimary onClick={props.onOpen} disabled={acting}>
            <Play size={14} /> Открыть визит
          </BtnPrimary>
        )}

        {!isLocked && statusId === STATUS_OPEN && (
          <>
            <BtnSecondary onClick={props.onSave} disabled={acting}>
              <Save size={14} /> Сохранить
            </BtnSecondary>
            <BtnPrimary onClick={props.onClose} disabled={acting}>
              <Sticker size={14} /> Закрыть
            </BtnPrimary>
          </>
        )}

        {canCancel && (
          <BtnSecondary onClick={onCancel} disabled={acting}>
            <Ban size={14} /> Отменить
          </BtnSecondary>
        )}

        {canEdit && (
          <BtnSecondary onClick={onEdit}>
            <Pencil size={14} /> Редактировать
          </BtnSecondary>
        )}
      </div>
    </>
  );
}

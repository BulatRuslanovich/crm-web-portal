import {
  Building2,
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  FileText,
  Pill,
  Stethoscope,
  Wrench,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export type AssistantToolName =
  | 'search_drugs'
  | 'search_physes'
  | 'search_orgs'
  | 'get_drug_details'
  | 'get_phys_details'
  | 'get_org_details'
  | 'list_activs'
  | 'get_activ_details'
  | 'propose_create_activ'
  | string;

export interface ToolMeta {
  runningLabel: string;
  doneLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const META: Record<string, ToolMeta> = {
  search_drugs: { runningLabel: 'Ищу препараты…', doneLabel: 'Препараты', icon: Pill },
  search_physes: { runningLabel: 'Ищу врачей…', doneLabel: 'Врачи', icon: Stethoscope },
  search_orgs: { runningLabel: 'Ищу организации…', doneLabel: 'Организации', icon: Building2 },
  get_drug_details: {
    runningLabel: 'Открываю карточку препарата…',
    doneLabel: 'Препарат',
    icon: Pill,
  },
  get_phys_details: {
    runningLabel: 'Открываю карточку врача…',
    doneLabel: 'Врач',
    icon: Stethoscope,
  },
  get_org_details: {
    runningLabel: 'Открываю карточку организации…',
    doneLabel: 'Организация',
    icon: Building2,
  },
  list_activs: { runningLabel: 'Смотрю визиты…', doneLabel: 'Визиты', icon: ClipboardList },
  get_activ_details: {
    runningLabel: 'Открываю визит…',
    doneLabel: 'Визит',
    icon: FileText,
  },
  propose_create_activ: {
    runningLabel: 'Готовлю черновик визита…',
    doneLabel: 'Черновик визита',
    icon: CalendarPlus,
  },
};

export function getToolMeta(name: string): ToolMeta {
  return (
    META[name] ?? {
      runningLabel: 'Выполняю запрос…',
      doneLabel: name,
      icon: Wrench,
    }
  );
}

export const ACTIV_ICON = CalendarCheck;

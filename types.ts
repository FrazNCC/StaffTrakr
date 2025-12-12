export interface Staff {
  id: string;
  name: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  defaultValue: number; // Positive for "cost" (sick), Negative for "contribution" (cover)
  color: string;
}

export interface EventLog {
  id: string;
  staffId: string;
  eventTypeId: string;
  date: string;
  academicYear: string; // e.g. "2024-25"
  value: number;
  notes: string;
}

export interface AppData {
  staff: Staff[];
  eventTypes: EventType[];
  logs: EventLog[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LOG_EVENT = 'LOG_EVENT',
  MANAGE_STAFF = 'MANAGE_STAFF',
  MANAGE_TYPES = 'MANAGE_TYPES',
  STORAGE = 'STORAGE',
}
export type DataType = 'text' | 'number' | 'select' | 'date' | 'url';
export type Permission = 'readonly' | 'readwrite';

export interface ColumnConfig {
  originalHeader: string;
  displayName: string;
  dataType: DataType;
  permission: Permission;
  options?: string[]; // Dynamic list of options for 'select' type
}

export interface AppState {
  step: 'upload' | 'config' | 'editor';
  rawData: any[];
  columns: ColumnConfig[];
  data: any[];
}

export type RowData = Record<string, any>;
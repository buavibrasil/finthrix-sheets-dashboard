export interface GoogleSheetsConfig {
  clientId: string;
  apiKey: string;
  discoveryDoc: string;
  scopes: string;
}

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
  sheets: SheetInfo[];
}

export interface SheetInfo {
  id: number;
  title: string;
  index: number;
  rowCount: number;
  columnCount: number;
}

export interface CellData {
  row: number;
  column: number;
  value: string | number | boolean;
  formattedValue?: string;
}

export interface RangeData {
  range: string;
  values: (string | number | boolean)[][];
  majorDimension?: 'ROWS' | 'COLUMNS';
}

export interface GoogleSheetsAuthState {
  isSignedIn: boolean;
  isInitialized: boolean;
  user?: {
    email: string;
    name: string;
    imageUrl: string;
  };
}

export interface ImportConfig {
  spreadsheetId: string;
  sheetName: string;
  range: string;
  hasHeaders: boolean;
  mapping: ColumnMapping[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
}

export interface SyncConfig {
  enabled: boolean;
  direction: 'import' | 'export' | 'bidirectional';
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
  lastSync?: Date;
  autoSync: boolean;
}

export interface GoogleSheetsError {
  code: string;
  message: string;
  details?: any;
}

export interface GoogleSheetsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: GoogleSheetsError;
}
export type AppStep = 'upload' | 'config' | 'processing' | 'review' | 'export';

export interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  previewUrl: string;
  pageCount?: number;
  isSample?: boolean;
  base64?: string;
  file?: File;
  originalSize?: number;
  wasOptimized?: boolean;
}

export interface SheetColumn {
  id: string;
  name: string;
  type?: 'text' | 'number' | 'date' | 'currency' | 'email';
}

export interface SheetConfig {
  id: string;
  name: string;
  columns: string[];
  description?: string;
}

export interface WorkbookConfig {
  filename: string;
  sheets: SheetConfig[];
  instructions: string;
  includeSourceColumn?: boolean;
  customApiKey?: string;
}

export interface CellValue {
  value: string | number;
  confidence: number; // 0 to 1
  flagged?: boolean;
  suggestedValue?: string | number;
  warningNote?: string;
}

export interface ExtractedSheetData {
  sheetId: string;
  sheetName: string;
  columns: string[];
  rows: Record<string, CellValue>[];
}

export interface ExtractedWorkbookData {
  workbookFilename: string;
  sheets: ExtractedSheetData[];
  overallConfidence: number;
  extractedAt: string;
  warningsCount: number;
  engineUsed?: string;
}

export interface ConversionHistoryItem {
  id: string;
  filename: string;
  sheetsCount: number;
  totalRows: number;
  timestamp: number;
  fileNames: string[];
}

import * as XLSX from 'xlsx';
import { ExtractedWorkbookData } from '../types';
import { sanitizeExcelFilename } from './fileValidation';

/**
 * Generates and downloads a real .xlsx Excel workbook
 * compliant with openpyxl/Excel specifications.
 */
export function generateExcelWorkbook(data: ExtractedWorkbookData): void {
  const wb = XLSX.utils.book_new();

  for (const sheet of data.sheets) {
    // Build raw 2D array: row 0 is header, followed by rows
    const headerRow = sheet.columns;
    const rowsArray: (string | number | boolean | null)[][] = [headerRow];

    for (const row of sheet.rows) {
      const rowValues = sheet.columns.map((colName) => {
        const cell = row[colName];
        if (cell === undefined || cell === null) {
          return '';
        }
        const val = (typeof cell === 'object' && cell !== null && 'value' in cell)
          ? cell.value
          : cell;

        if (val === undefined || val === null) {
          return '';
        }
        // Attempt to preserve pure numeric types
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          // If pure number string without special symbols
          const trimmed = val.trim();
          if (trimmed !== '' && !isNaN(Number(trimmed)) && !trimmed.startsWith('0') && trimmed.length < 15) {
            return Number(trimmed);
          }
          return trimmed;
        }
        return String(val);
      });
      rowsArray.push(rowValues);
    }

    const ws = XLSX.utils.aoa_to_sheet(rowsArray);

    // Calculate auto column widths
    const colWidths = sheet.columns.map((col, colIdx) => {
      let maxLen = col.length;
      for (let r = 1; r < rowsArray.length; r++) {
        const valStr = String(rowsArray[r][colIdx] ?? '');
        if (valStr.length > maxLen) {
          maxLen = Math.min(valStr.length, 50); // cap max width
        }
      }
      return { wch: Math.max(maxLen + 3, 12) };
    });
    ws['!cols'] = colWidths;

    // Sanitize sheet name (Excel limit 31 chars, no invalid chars : \ / ? * [ ])
    let baseSheetName = (sheet.sheetName || 'Sheet')
      .replace(/[\\/*?:\[\]]/g, '_')
      .trim()
      .substring(0, 31) || 'Sheet';

    let safeSheetName = baseSheetName;
    let duplicateCounter = 2;
    while (wb.SheetNames.includes(safeSheetName)) {
      safeSheetName = `${baseSheetName.substring(0, 28)}_${duplicateCounter++}`;
    }

    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  }

  const finalFilename = sanitizeExcelFilename(data.workbookFilename || 'extracted_data.xlsx');
  XLSX.writeFile(wb, finalFilename, { bookType: 'xlsx', type: 'binary' });
}

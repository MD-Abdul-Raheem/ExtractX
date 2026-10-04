import { ExtractedWorkbookData, ExtractedSheetData, CellValue } from '../types';

/**
 * Merges multiple ExtractedWorkbookData structures (from separate batch runs)
 * into a single unified workbook.
 */
export function mergeExtractedWorkbooks(
  workbooks: ExtractedWorkbookData[],
  targetFilename: string,
  includeSourceColumn: boolean = true
): ExtractedWorkbookData {
  if (workbooks.length === 0) {
    return {
      workbookFilename: targetFilename,
      sheets: [
        {
          sheetId: 'sheet-1',
          sheetName: 'Extracted Data',
          columns: ['Field', 'Value'],
          rows: [],
        },
      ],
      overallConfidence: 0.95,
      extractedAt: new Date().toISOString(),
      warningsCount: 0,
      engineUsed: 'Extraction Engine',
    };
  }

  if (workbooks.length === 1) {
    return {
      ...workbooks[0],
      workbookFilename: targetFilename,
    };
  }

  // Group sheets by normalized name
  const sheetMap = new Map<
    string,
    {
      sheetName: string;
      columns: Set<string>;
      rows: Record<string, CellValue>[];
    }
  >();

  workbooks.forEach((wb) => {
    wb.sheets.forEach((sheet) => {
      const normKey = sheet.sheetName.trim().toLowerCase();
      let entry = sheetMap.get(normKey);

      if (!entry) {
        entry = {
          sheetName: sheet.sheetName,
          columns: new Set<string>(sheet.columns),
          rows: [],
        };
        sheetMap.set(normKey, entry);
      }

      // Merge columns
      sheet.columns.forEach((col) => entry!.columns.add(col));

      // Append rows
      entry.rows.push(...sheet.rows);
    });
  });

  const finalSheets: ExtractedSheetData[] = Array.from(sheetMap.values()).map(
    (item, sIdx) => {
      let columns = Array.from(item.columns);

      // Ensure Source Document column is at the start if enabled and multiple files
      if (includeSourceColumn && !columns.includes('Source Document')) {
        columns.unshift('Source Document');
      }

      // Standardize rows so all cells exist
      const harmonizedRows = item.rows.map((row) => {
        const rowRecord: Record<string, CellValue> = {};
        columns.forEach((col) => {
          if (row[col]) {
            rowRecord[col] = row[col];
          } else {
            rowRecord[col] = {
              value: '',
              confidence: 1.0,
              flagged: false,
            };
          }
        });
        return rowRecord;
      });

      return {
        sheetId: `sheet-${sIdx + 1}`,
        sheetName: item.sheetName,
        columns,
        rows: harmonizedRows,
      };
    }
  );

  const engines = Array.from(
    new Set(workbooks.map((w) => w.engineUsed).filter(Boolean))
  );
  const avgConf =
    workbooks.reduce((acc, w) => acc + (w.overallConfidence || 0.95), 0) /
    workbooks.length;
  const totalWarnings = workbooks.reduce((acc, w) => acc + (w.warningsCount || 0), 0);

  return {
    workbookFilename: targetFilename,
    sheets: finalSheets,
    overallConfidence: Number(avgConf.toFixed(2)),
    extractedAt: new Date().toISOString(),
    warningsCount: totalWarnings,
    engineUsed: engines.join(', ') || 'Batch Multi-Document Engine',
  };
}

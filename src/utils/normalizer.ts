import { ExtractedWorkbookData, ExtractedSheetData, CellValue } from '../types';

/**
 * Normalizes any workbook data structure from AI models or parsers
 * into a strictly valid, type-safe ExtractedWorkbookData object.
 */
export function normalizeWorkbookData(
  raw: any,
  fallbackFilename: string = 'extracted_data.xlsx'
): ExtractedWorkbookData {
  if (!raw || typeof raw !== 'object') {
    return {
      workbookFilename: fallbackFilename,
      sheets: [
        {
          sheetId: 'sheet-1',
          sheetName: 'Sheet1',
          columns: ['Record / Item', 'Description', 'Value', 'Status'],
          rows: [],
        },
      ],
      overallConfidence: 0.95,
      extractedAt: new Date().toISOString(),
      warningsCount: 0,
      engineUsed: 'Extraction Engine',
    };
  }

  let rawSheets = Array.isArray(raw.sheets) ? raw.sheets : [];
  if (rawSheets.length === 0) {
    if (Array.isArray(raw.rows) || Array.isArray(raw.data)) {
      rawSheets = [
        {
          sheetName: 'Extracted Data',
          rows: raw.rows || raw.data,
          columns: raw.columns || [],
        },
      ];
    } else if (raw.tables && Array.isArray(raw.tables)) {
      rawSheets = raw.tables.map((t: any, idx: number) => ({
        sheetName: t.name || t.title || `Table_${idx + 1}`,
        rows: t.rows || t.data || [],
        columns: t.columns || t.headers || [],
      }));
    } else {
      rawSheets = [
        {
          sheetName: 'Sheet1',
          rows: [],
          columns: ['Item', 'Details', 'Value'],
        },
      ];
    }
  }

  const sheets: ExtractedSheetData[] = rawSheets.map((s: any, sIdx: number) => {
    const sheetId = s.sheetId || s.id || `sheet-${sIdx + 1}`;
    let sheetName = String(s.sheetName || s.name || `Sheet_${sIdx + 1}`)
      .trim()
      .replace(/[\\/*?:\[\]]/g, '_')
      .substring(0, 31);
    if (!sheetName) sheetName = `Sheet_${sIdx + 1}`;

    const rawRows = Array.isArray(s.rows)
      ? s.rows
      : Array.isArray(s.data)
      ? s.data
      : [];

    // Discover columns from sheet.columns or inspect row objects
    const colSet = new Set<string>();
    if (Array.isArray(s.columns)) {
      s.columns.forEach((c: any) => {
        if (c !== null && c !== undefined) {
          const str = String(c).trim();
          if (str) colSet.add(str);
        }
      });
    }

    rawRows.forEach((r: any) => {
      if (r && typeof r === 'object' && !Array.isArray(r)) {
        Object.keys(r).forEach((k) => {
          const trimmed = k.trim();
          if (trimmed) colSet.add(trimmed);
        });
      }
    });

    let columns = Array.from(colSet);
    if (columns.length === 0) {
      columns = ['Column 1', 'Column 2', 'Column 3'];
    }

    // Standardize every row to Record<string, CellValue>
    const rows: Record<string, CellValue>[] = rawRows.map((r: any) => {
      const rowObj: Record<string, CellValue> = {};

      if (Array.isArray(r)) {
        columns.forEach((col, cIdx) => {
          const val = r[cIdx] !== undefined && r[cIdx] !== null ? r[cIdx] : '';
          rowObj[col] = {
            value: typeof val === 'object' && 'value' in val ? (val.value ?? '') : val,
            confidence: 0.98,
            flagged: false,
          };
        });
      } else if (r && typeof r === 'object') {
        columns.forEach((col) => {
          let cellData = r[col];

          // If exact key match not found, check case-insensitive match
          if (cellData === undefined) {
            const foundKey = Object.keys(r).find(
              (k) => k.trim().toLowerCase() === col.toLowerCase()
            );
            if (foundKey) cellData = r[foundKey];
          }

          if (cellData === null || cellData === undefined) {
            rowObj[col] = { value: '', confidence: 1.0, flagged: false };
          } else if (
            typeof cellData === 'object' &&
            !Array.isArray(cellData) &&
            'value' in cellData
          ) {
            const rawVal = cellData.value !== undefined && cellData.value !== null ? cellData.value : '';
            rowObj[col] = {
              value: rawVal,
              confidence:
                typeof cellData.confidence === 'number'
                  ? Math.min(Math.max(cellData.confidence, 0), 1)
                  : 0.98,
              flagged: Boolean(cellData.flagged),
              warningNote: cellData.warningNote ? String(cellData.warningNote) : undefined,
              suggestedValue: cellData.suggestedValue,
            };
          } else {
            // Primitive value (string, number, boolean)
            rowObj[col] = {
              value: cellData,
              confidence: 0.98,
              flagged: false,
            };
          }
        });
      } else {
        // Fallback for unexpected row formats
        columns.forEach((col, idx) => {
          rowObj[col] = { value: idx === 0 ? String(r) : '', confidence: 0.95, flagged: false };
        });
      }

      return rowObj;
    });

    return {
      sheetId,
      sheetName,
      columns,
      rows,
    };
  });

  const totalFlagged = sheets.reduce(
    (acc, s) =>
      acc +
      s.rows.reduce(
        (rAcc, r) => rAcc + Object.values(r).filter((c) => c && c.flagged).length,
        0
      ),
    0
  );

  return {
    workbookFilename: raw.workbookFilename || fallbackFilename,
    sheets,
    overallConfidence:
      typeof raw.overallConfidence === 'number'
        ? Math.min(Math.max(raw.overallConfidence, 0), 1)
        : 0.98,
    extractedAt: raw.extractedAt || new Date().toISOString(),
    warningsCount: totalFlagged,
    engineUsed: raw.engineUsed || 'Extraction Engine',
  };
}

import React, { useState } from 'react';
import { ExtractedWorkbookData, ExtractedSheetData, UploadedDoc } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Search,
  Eye,
  Info,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ReviewStepProps {
  data: ExtractedWorkbookData;
  files?: UploadedDoc[];
  activeDoc: UploadedDoc | null;
  svgPreview?: string;
  onDataChange: (newData: ExtractedWorkbookData) => void;
  onBack: () => void;
  onContinueToExport: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  files = [],
  activeDoc,
  svgPreview,
  onDataChange,
  onBack,
  onContinueToExport,
}) => {
  const [selectedDocIdx, setSelectedDocIdx] = useState(0);
  const currentDoc = files[selectedDocIdx] || activeDoc;
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showOverlay, setShowOverlay] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colName: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddColModal, setShowAddColModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [renamingSheetIdx, setRenamingSheetIdx] = useState<number | null>(null);
  const [renameSheetValue, setRenameSheetValue] = useState<string>('');

  const safeSheets = (data && Array.isArray(data.sheets) && data.sheets.length > 0)
    ? data.sheets
    : [{ sheetId: 'sheet-1', sheetName: 'Sheet 1', columns: ['Column 1', 'Column 2'], rows: [] }];
  const currentSheet: ExtractedSheetData = safeSheets[activeSheetIndex] || safeSheets[0];

  const handleStartRenameSheet = (sIdx: number, currentName: string) => {
    setRenamingSheetIdx(sIdx);
    setRenameSheetValue(currentName);
  };

  const handleSaveSheetName = (sIdx: number) => {
    const trimmed = renameSheetValue.trim();
    if (trimmed) {
      const updatedSheets = safeSheets.map((s, idx) =>
        idx === sIdx ? { ...s, sheetName: trimmed.substring(0, 31) } : s
      );
      onDataChange({ ...data, sheets: updatedSheets });
    }
    setRenamingSheetIdx(null);
  };

  const handleDeleteSheet = (sIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (safeSheets.length <= 1) return;
    const updatedSheets = safeSheets.filter((_, idx) => idx !== sIdx);
    onDataChange({ ...data, sheets: updatedSheets });
    if (activeSheetIndex >= updatedSheets.length) {
      setActiveSheetIndex(Math.max(0, updatedSheets.length - 1));
    }
  };

  const handleCellClick = (rowIdx: number, colName: string) => {
    const cell = currentSheet.rows[rowIdx]?.[colName];
    const val = cell && typeof cell === 'object' && 'value' in cell ? cell.value : cell;
    setEditingCell({ rowIdx, colName });
    setEditValue(val !== undefined && val !== null ? String(val) : '');
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const { rowIdx, colName } = editingCell;

    const updatedSheets = safeSheets.map((sheet, sIdx) => {
      if (sIdx !== activeSheetIndex) return sheet;

      const updatedRows = [...sheet.rows];
      const targetRow = { ...updatedRows[rowIdx] };
      const currentCell = targetRow[colName] || { confidence: 1.0, value: '' };

      // Try numeric conversion if applicable
      let parsedValue: string | number = editValue;
      if (!isNaN(Number(editValue)) && editValue.trim() !== '' && !editValue.startsWith('0') && editValue.length < 15) {
        parsedValue = Number(editValue);
      }

      targetRow[colName] = {
        ...(typeof currentCell === 'object' ? currentCell : {}),
        value: parsedValue,
        confidence: 1.0, // manually validated
        flagged: false, // resolved warning
        warningNote: undefined,
      };

      updatedRows[rowIdx] = targetRow;
      return { ...sheet, rows: updatedRows };
    });

    onDataChange({
      ...data,
      sheets: updatedSheets,
    });
    setEditingCell(null);
  };

  const handleCancelCell = () => {
    setEditingCell(null);
  };

  const handleAddRow = () => {
    const newRowRecord: Record<string, { value: string; confidence: number }> = {};
    currentSheet.columns.forEach((col) => {
      newRowRecord[col] = { value: '', confidence: 1.0 };
    });

    const updatedSheets = safeSheets.map((sheet, sIdx) => {
      if (sIdx !== activeSheetIndex) return sheet;
      return { ...sheet, rows: [...sheet.rows, newRowRecord] };
    });

    onDataChange({ ...data, sheets: updatedSheets });
  };

  const handleDeleteRow = (rowIdx: number) => {
    const updatedSheets = safeSheets.map((sheet, sIdx) => {
      if (sIdx !== activeSheetIndex) return sheet;
      const nextRows = [...sheet.rows];
      nextRows.splice(rowIdx, 1);
      return { ...sheet, rows: nextRows };
    });

    onDataChange({ ...data, sheets: updatedSheets });
  };

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCol = newColName.trim();
    if (!cleanCol) return;

    const updatedSheets = safeSheets.map((sheet, sIdx) => {
      if (sIdx !== activeSheetIndex) return sheet;
      if (sheet.columns.includes(cleanCol)) return sheet;

      const nextCols = [...sheet.columns, cleanCol];
      const nextRows = sheet.rows.map((row) => ({
        ...row,
        [cleanCol]: { value: '', confidence: 1.0 },
      }));

      return { ...sheet, columns: nextCols, rows: nextRows };
    });

    onDataChange({ ...data, sheets: updatedSheets });
    setNewColName('');
    setShowAddColModal(false);
  };

  const handleDeleteColumn = (colName: string) => {
    if (currentSheet.columns.length <= 1) return;

    const updatedSheets = safeSheets.map((sheet, sIdx) => {
      if (sIdx !== activeSheetIndex) return sheet;
      const nextCols = sheet.columns.filter((c) => c !== colName);
      const nextRows = sheet.rows.map((row) => {
        const copy = { ...row };
        delete copy[colName];
        return copy;
      });
      return { ...sheet, columns: nextCols, rows: nextRows };
    });

    onDataChange({ ...data, sheets: updatedSheets });
  };

  const handleApproveAllFlagged = () => {
    const updatedSheets = safeSheets.map((sheet) => ({
      ...sheet,
      rows: sheet.rows.map((row) => {
        const copy = { ...row };
        Object.keys(copy).forEach((col) => {
          const c = copy[col];
          if (c && typeof c === 'object' && c.flagged) {
            copy[col] = { ...c, flagged: false, confidence: 1.0, warningNote: undefined };
          }
        });
        return copy;
      }),
    }));
    onDataChange({ ...data, sheets: updatedSheets, warningsCount: 0 });
  };

  const handleAddSheet = () => {
    const newIdx = safeSheets.length + 1;
    const newSheet: ExtractedSheetData = {
      sheetId: `sheet-${Date.now()}`,
      sheetName: `Sheet ${newIdx}`,
      columns: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        {
          'Column 1': { value: '', confidence: 1.0 },
          'Column 2': { value: '', confidence: 1.0 },
          'Column 3': { value: '', confidence: 1.0 },
        },
      ],
    };
    onDataChange({
      ...data,
      sheets: [...safeSheets, newSheet],
    });
    setActiveSheetIndex(safeSheets.length);
  };

  // Filter rows if searching
  const filteredRows = currentSheet.rows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return currentSheet.columns.some((col) => {
      const cell = row[col];
      const val = cell && typeof cell === 'object' && 'value' in cell ? cell.value : cell;
      return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
    });
  });

  const totalFlaggedCells = safeSheets.reduce((acc, sheet) => {
    return (
      acc +
      sheet.rows.reduce((rAcc, row) => {
        return (
          rAcc +
          Object.values(row).filter((cell) => cell && typeof cell === 'object' && cell.flagged).length
        );
      }, 0)
    );
  }, 0);

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-6">
      {/* Top Banner with Alert & Instructions */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">
                Review &amp; Correct Extracted Data
              </h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {data.workbookFilename}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Cross-reference the document preview on the left with the extracted workbook on the right. All cells and columns are fully editable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalFlaggedCells > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{totalFlaggedCells} flagged cell(s)</span>
              </div>
              <button
                type="button"
                onClick={handleApproveAllFlagged}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors"
                title="Mark all flagged OCR cells as verified"
              >
                Approve All
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>All cells verified</span>
            </div>
          )}

          <button
            type="button"
            id="btn-continue-to-export"
            onClick={onContinueToExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Proceed to Export</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Grid (LEFT: Document Preview, RIGHT: Extracted Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT COLUMN: Document Preview ================= */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[740px]">
          {/* Preview Toolbar */}
          <div className="border-b border-neutral-200 px-3.5 py-2.5 bg-neutral-50 flex items-center justify-between text-xs text-neutral-600">
            <div className="flex items-center gap-2 min-w-0">
              {files.length > 1 ? (
                <select
                  value={selectedDocIdx}
                  onChange={(e) => setSelectedDocIdx(Number(e.target.value))}
                  className="font-semibold text-neutral-900 bg-white border border-neutral-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 max-w-[180px] truncate"
                >
                  {files.map((f, fIdx) => (
                    <option key={f.id || fIdx} value={fIdx}>
                      {f.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-neutral-900 truncate max-w-[200px]">
                  {currentDoc?.name || 'Document Preview'}
                </span>
              )}
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-500 font-mono text-[11px]">
                {(currentDoc?.pageCount && currentDoc.pageCount > 1)
                  ? `Page ${currentPage} of ${currentDoc.pageCount}`
                  : 'Document View'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {currentDoc?.pageCount && currentDoc.pageCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(currentDoc.pageCount || 1, p + 1))}
                    disabled={currentPage >= (currentDoc.pageCount || 1)}
                    className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-neutral-300 mx-1">|</span>
                </>
              )}

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="p-1 rounded hover:bg-neutral-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-9 text-center font-medium">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                className="p-1 rounded hover:bg-neutral-200"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 rounded hover:bg-neutral-200"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preview Viewport */}
          <div className="flex-1 bg-neutral-100/90 overflow-auto p-4 flex items-center justify-center relative">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="relative shadow-md rounded border border-neutral-300 bg-white"
            >
              {/* Document Image / SVG / PDF Preview */}
              {currentDoc?.isSample && svgPreview ? (
                <img
                  src={svgPreview}
                  alt="Scanned Document Preview"
                  className="max-w-none w-[540px] block select-none"
                />
              ) : currentDoc?.previewUrl ? (
                currentDoc.type.includes('pdf') ? (
                  <iframe
                    src={currentDoc.previewUrl}
                    title="PDF Document Preview"
                    className="w-[540px] h-[750px] border-0 bg-white"
                  />
                ) : (
                  <img
                    src={currentDoc.previewUrl}
                    alt="Document"
                    className="max-w-none w-[540px] block"
                  />
                )
              ) : (
                <div className="w-[540px] h-[750px] flex items-center justify-center text-neutral-400">
                  Document Preview
                </div>
              )}

              {/* Status Header Overlay for extracted sheet */}
              <div className="absolute top-3 left-3 right-3 pointer-events-none flex justify-between items-center">
                <div className="bg-slate-900/90 text-white text-[10px] font-mono px-2.5 py-1 rounded shadow-md backdrop-blur-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sheet: {currentSheet.sheetName} ({currentSheet.rows.length} rows)</span>
                </div>
                <div className="bg-emerald-900/90 text-emerald-100 text-[10px] font-mono px-2 py-0.5 rounded shadow-md">
                  Confidence: {(data.overallConfidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 border-t border-neutral-200 bg-neutral-50 text-[11px] text-neutral-500 flex items-center justify-between">
            <span className="font-medium text-slate-700">Engine: {data.engineUsed || 'Gemini Multimodal OCR'}</span>
            <span>Extracted {safeSheets.reduce((a, s) => a + s.rows.length, 0)} total rows across {safeSheets.length} sheet(s)</span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Structured Data Table ================= */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[740px]">
          {/* Sheet Selector Tabs */}
          <div className="border-b border-neutral-200 bg-neutral-50/80 px-4 pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {safeSheets.map((sheet, sIdx) => {
                const isActive = activeSheetIndex === sIdx;
                const flaggedInSheet = sheet.rows.reduce(
                  (cnt, row) => cnt + Object.values(row).filter((c) => c && typeof c === 'object' && c.flagged).length,
                  0
                );
                const isRenaming = renamingSheetIdx === sIdx;

                return (
                  <div
                    key={sheet.sheetId}
                    onClick={() => {
                      if (!isRenaming) {
                        setActiveSheetIndex(sIdx);
                        setEditingCell(null);
                      }
                    }}
                    className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-lg border-t border-x cursor-pointer transition-all ${
                      isActive
                        ? 'bg-white border-neutral-200 text-neutral-900 border-b-white -mb-px shadow-2xs'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {isRenaming ? (
                      <input
                        type="text"
                        value={renameSheetValue}
                        onChange={(e) => setRenameSheetValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveSheetName(sIdx);
                          if (e.key === 'Escape') setRenamingSheetIdx(null);
                        }}
                        onBlur={() => handleSaveSheetName(sIdx)}
                        autoFocus
                        className="px-1.5 py-0.5 text-xs font-semibold rounded border border-emerald-500 bg-white text-neutral-900 focus:outline-none w-28"
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartRenameSheet(sIdx, sheet.sheetName)}
                        title="Double-click to rename sheet"
                      >
                        {sheet.sheetName}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-slate-900 text-white' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {sheet.rows.length}
                    </span>

                    {flaggedInSheet > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Contains flagged cells" />
                    )}

                    {/* Rename sheet button */}
                    {!isRenaming && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRenameSheet(sIdx, sheet.sheetName);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-opacity"
                        title="Rename sheet"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete sheet button (only if > 1 sheet) */}
                    {safeSheets.length > 1 && !isRenaming && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSheet(sIdx, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-neutral-400 hover:text-red-600 transition-opacity"
                        title="Delete sheet"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddSheet}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
                title="Add new sheet"
              >
                <Plus className="w-3 h-3" />
                <span>Sheet</span>
              </button>
            </div>

            <div className="pb-1">
              <button
                type="button"
                onClick={() => setShowAddColModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white border border-neutral-300 hover:bg-neutral-50 px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Column</span>
              </button>
            </div>
          </div>

          {/* Action Bar (Search, Row Count, Add Row) */}
          <div className="p-3 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 bg-white">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search values in table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-md border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                Showing {filteredRows.length} of {currentSheet.rows.length} rows
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto bg-neutral-50/30">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-100 text-neutral-700 font-semibold sticky top-0 z-10 border-b border-neutral-300">
                <tr>
                  <th className="p-2.5 w-12 text-center text-neutral-400 font-mono text-[10px] border-r border-neutral-200 bg-neutral-100">
                    #
                  </th>
                  {currentSheet.columns.map((col) => (
                    <th
                      key={col}
                      className="p-2.5 border-r border-neutral-200 font-bold tracking-tight text-neutral-800 uppercase text-[11px] whitespace-nowrap bg-neutral-100 group"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span>{col}</span>
                        {currentSheet.columns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteColumn(col)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-opacity p-0.5 rounded"
                            title={`Delete column ${col}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-2.5 w-12 text-center bg-neutral-100"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200 bg-white">
                {filteredRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-neutral-50/80 transition-colors group">
                    <td className="p-2 text-center text-neutral-400 font-mono text-[10px] border-r border-neutral-200 bg-neutral-50/50 select-none">
                      {rowIdx + 1}
                    </td>

                    {currentSheet.columns.map((col) => {
                      const cell = row[col];
                      const rawVal = cell && typeof cell === 'object' && 'value' in cell ? cell.value : cell;
                      const isEditing =
                        editingCell?.rowIdx === rowIdx && editingCell?.colName === col;
                      const hasWarning = Boolean(cell && typeof cell === 'object' && cell.flagged);

                      return (
                        <td
                          key={col}
                          onClick={() => handleCellClick(rowIdx, col)}
                          className={`p-2 border-r border-neutral-200 text-neutral-900 cursor-pointer relative transition-colors ${
                            hasWarning
                              ? 'bg-amber-50/70 hover:bg-amber-100/70'
                              : 'hover:bg-neutral-100/60'
                          }`}
                        >
                          {isEditing ? (
                            <div
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                autoFocus
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveCell();
                                  if (e.key === 'Escape') handleCancelCell();
                                }}
                                className="w-full px-2 py-1 text-xs border border-slate-900 rounded bg-white focus:outline-none ring-1 ring-slate-900"
                              />
                              <button
                                type="button"
                                onClick={handleSaveCell}
                                className="p-1 bg-slate-900 text-white rounded hover:bg-slate-800"
                                title="Save"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelCell}
                                className="p-1 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-1.5 min-h-[22px]">
                              <span
                                className={`truncate ${
                                  rawVal === '' || rawVal === undefined || rawVal === null
                                    ? 'text-neutral-300 italic'
                                    : 'font-medium'
                                }`}
                              >
                                {rawVal !== '' && rawVal !== undefined && rawVal !== null
                                  ? String(rawVal)
                                  : '(empty)'}
                              </span>

                              {hasWarning && (
                                <div
                                  className="shrink-0 flex items-center text-amber-600 bg-amber-100 px-1 py-0.2 rounded text-[10px] font-semibold"
                                  title={(cell && typeof cell === 'object' && cell.warningNote) || 'Review OCR token'}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                  <span>Review</span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-1.5 text-center w-10">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(rowIdx)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-opacity"
                        title="Delete this row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Help */}
          <div className="p-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Click any cell to edit value directly. Press Enter to commit.</span>
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="text-xs font-medium text-slate-800 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add row at bottom</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Column Modal */}
      {showAddColModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-lg border border-neutral-200">
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
              Add New Column to {currentSheet.sheetName}
            </h4>
            <p className="text-xs text-neutral-500 mb-4">
              Enter a header name for the new column. You can populate its cells immediately in the table.
            </p>

            <form onSubmit={handleAddColumnSubmit}>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Notes, Country, Tax..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 mb-4"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddColModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Add Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Configuration</span>
        </button>

        <button
          type="button"
          onClick={onContinueToExport}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-xs"
        >
          <span>Complete Review &amp; Export</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

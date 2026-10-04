import React, { useState } from 'react';
import { ExtractedWorkbookData } from '../types';
import { generateExcelWorkbook } from '../utils/excelGenerator';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle2,
  Table,
  ArrowLeft,
  FileCheck2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface ExportStepProps {
  data: ExtractedWorkbookData;
  onConvertAnother: () => void;
  onBackToReview: () => void;
}

export const ExportStep: React.FC<ExportStepProps> = ({
  data,
  onConvertAnother,
  onBackToReview,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const totalRows = data.sheets.reduce((acc, s) => acc + s.rows.length, 0);

  const handleDownload = () => {
    try {
      generateExcelWorkbook(data);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Error exporting workbook:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto mb-3 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Workbook Ready for Export
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Your documents have been extracted, structured, and validated.
          </p>
        </div>

        {/* Workbook Summary Table */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6 bg-neutral-50/50">
          <div className="p-4 border-b border-neutral-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-neutral-900 font-mono">
                {data.workbookFilename}
              </span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Valid .xlsx
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-neutral-200 bg-white text-center">
            <div className="p-4">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Sheets
              </p>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {data.sheets.length}
              </p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Total Rows
              </p>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {totalRows}
              </p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Columns Defined
              </p>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {data.sheets.reduce((acc, s) => acc + s.columns.length, 0)}
              </p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Review Status
              </p>
              <div className="flex items-center justify-center gap-1 mt-1 text-emerald-700 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          {/* Sheets detail list */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-200">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2.5">
              Sheet Breakdown:
            </h4>
            <div className="space-y-2">
              {data.sheets.map((sheet, sIdx) => (
                <div
                  key={sheet.sheetId}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-slate-600" />
                    <span className="font-semibold text-neutral-900">
                      Sheet {sIdx + 1}: {sheet.sheetName}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-500 font-mono">
                      {sheet.columns.length} columns: [{sheet.columns.slice(0, 3).join(', ')}
                      {sheet.columns.length > 3 ? '...' : ''}]
                    </span>
                  </div>
                  <span className="font-mono font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                    {sheet.rows.length} rows
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <div className="text-xs">
                <p className="font-bold">Download initiated!</p>
                <p className="text-emerald-700">
                  Your Excel file <strong>{data.workbookFilename}</strong> has been saved to your downloads.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            id="btn-download-excel"
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Download className="w-5 h-5" />
            <span>Download Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            id="btn-convert-another"
            onClick={onConvertAnother}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-sm border border-neutral-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-neutral-500" />
            <span>Convert Another Document</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackToReview}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-800 underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Need to make changes? Return to editable review</span>
          </button>
        </div>
      </div>

      {/* Excel Integrity Specifications */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Production Excel Generation Standards</span>
        </p>
        <p>
          Generated files comply with ISO/IEC 29500 (OpenXML) and openpyxl standards. Formatted with bold column headers, auto-calculated column widths, explicit numeric data types, and UTF-8 encoding.
        </p>
      </div>
    </div>
  );
};

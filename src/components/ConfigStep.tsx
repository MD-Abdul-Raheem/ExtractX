import React from 'react';
import { WorkbookConfig, UploadedDoc } from '../types';
import {
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText
} from 'lucide-react';

interface ConfigStepProps {
  config: WorkbookConfig;
  onChangeConfig: (newConfig: WorkbookConfig) => void;
  onBack: () => void;
  onStartExtraction: () => void;
  files?: UploadedDoc[];
}

const QUICK_PROMPTS = [
  {
    label: 'Auto-Detect All Data',
    text: 'Auto-detect all document sections, tables, headers, line items, and key-value summaries. Faithfully extract all rows into relevant sheets with clear column headers.',
  },
  {
    label: '2 Sheets: Summary & Line Items',
    text: 'Create 2 sheets: 1) "Summary" with document number, dates, parties/vendor, and totals. 2) "Line Items" with itemized descriptions, quantities, unit prices, and amounts.',
  },
  {
    label: 'Single Consolidated Sheet',
    text: 'Extract all document records, line items, and data into a single comprehensive sheet with clean column headers.',
  },
  {
    label: 'Financial: Overview & Transactions',
    text: 'Create 2 sheets: 1) "Overview" with account details, period, opening/closing balance. 2) "Transactions" with date, description, category, and credit/debit amounts.',
  },
];

export const ConfigStep: React.FC<ConfigStepProps> = ({
  config,
  onChangeConfig,
  onBack,
  onStartExtraction,
  files = [],
}) => {
  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val && !val.toLowerCase().endsWith('.xlsx')) {
      // allow user typing freely
    }
    onChangeConfig({
      ...config,
      filename: val,
    });
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeConfig({
      ...config,
      instructions: e.target.value,
      sheets: [], // empty sheets allows dynamic adaptive extraction guided by the instructions
    });
  };

  const handleApplyPrompt = (promptText: string) => {
    onChangeConfig({
      ...config,
      instructions: promptText,
      sheets: [],
    });
  };

  const primaryFile = files[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 mb-3 border border-emerald-200/60 shadow-xs">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Configure Excel Output
        </h1>
        <p className="text-sm text-neutral-600 mt-1 max-w-lg mx-auto">
          Guide how your data should be placed into sheets, sheet names, number of sheets, or leave blank to auto-detect.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Document Indicator if available */}
        {primaryFile && (
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-600">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="font-medium text-neutral-800 truncate">{primaryFile.name}</span>
              {files.length > 1 && (
                <span className="text-neutral-500 font-normal">
                  (+{files.length - 1} more file{files.length > 2 ? 's' : ''})
                </span>
              )}
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200/60 shrink-0">
              Ready for extraction
            </span>
          </div>
        )}

        {/* Excel Filename Input */}
        <div>
          <label htmlFor="workbook-filename-input" className="block text-sm font-semibold text-neutral-800 mb-1.5">
            Excel Filename
          </label>
          <div className="relative">
            <input
              id="workbook-filename-input"
              type="text"
              value={config.filename}
              onChange={handleFilenameChange}
              placeholder="extracted_records.xlsx"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Single Guide Text Box */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="sheet-guidance-textarea" className="block text-sm font-semibold text-neutral-800">
              Sheet Placement & Data Guidance
            </label>
            <span className="text-xs text-neutral-500">
              Guide sheets, names & data placement
            </span>
          </div>
          <p className="text-xs text-neutral-500 mb-2">
            Tell the AI which data has to be placed in which sheet, sheet names, number of sheets, and any specific columns.
          </p>
          <textarea
            id="sheet-guidance-textarea"
            rows={7}
            value={config.instructions}
            onChange={handleInstructionsChange}
            placeholder="e.g. Create 2 sheets:&#10;1) 'Summary' with Invoice #, Date, Vendor Name, Due Date, Subtotal, Tax, and Total.&#10;2) 'Line Items' with Item Description, Quantity, Unit Price, and Amount.&#10;&#10;(Or simply describe how you want your data organized into sheets)"
            className="w-full p-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors placeholder:text-neutral-400 font-sans"
          />

          {/* Quick Prompt Suggestion Chips */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick templates (click to apply to the text box):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  id={`quick-prompt-btn-${idx}`}
                  type="button"
                  onClick={() => handleApplyPrompt(qp.text)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left ${
                    config.instructions === qp.text
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium shadow-2xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Document Options (Shown when files > 1) */}
        {files.length > 1 && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Multi-Document Batch Consolidation ({files.length} documents)
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Records from all files will be extracted and merged into matching sheets.
                </p>
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-900 select-none">
              <input
                type="checkbox"
                checked={config.includeSourceColumn !== false}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    includeSourceColumn: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Add "Source Document" column to track which file each row came from</span>
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
          <button
            id="config-back-btn"
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            id="config-start-btn"
            type="button"
            onClick={onStartExtraction}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all"
          >
            <span>Start Extraction</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

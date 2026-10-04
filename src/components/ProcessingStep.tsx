import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Loader2,
  Circle,
  ShieldAlert,
  Cpu,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Key,
  Layers,
  Sparkles
} from 'lucide-react';
import { UploadedDoc, WorkbookConfig, ExtractedWorkbookData } from '../types';
import { SAMPLE_DOCS } from '../data/sampleDocuments';
import { mergeExtractedWorkbooks } from '../utils/workbookMerger';

interface ProcessingStepProps {
  files: UploadedDoc[];
  config: WorkbookConfig;
  onSuccess: (data: ExtractedWorkbookData) => void;
  onComplete: () => void;
}

interface PipelineStage {
  id: string;
  name: string;
  detail: string;
}

const STAGES: PipelineStage[] = [
  { id: 'uploading', name: 'Batch Ingestion & Compression', detail: 'Securing file payload & optimizing multi-file raster' },
  { id: 'reading', name: 'Multi-Document Analysis', detail: 'Parsing layout geometry, multi-page layers & table grids' },
  { id: 'extracting', name: 'Multimodal OCR Extraction', detail: 'Deep character recognition & row token extraction' },
  { id: 'structuring', name: 'Structuring & Harmonizing', detail: 'Consolidating records across documents into target sheets' },
  { id: 'preparing', name: 'Confidence Verification', detail: 'Auditing cell confidence scores & generating review grid' },
];

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  files,
  config,
  onSuccess,
  onComplete,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    `[INIT] Batch processor initialized for ${files.length} document(s)...`,
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>(
    () => sessionStorage.getItem('extractx_user_key') || ''
  );
  const extractionStartedRef = useRef<boolean>(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const executeExtraction = async () => {
    setError(null);
    setCurrentStageIdx(0);
    addLog(`[START] Ingesting ${files.length} document(s)...`);

    try {
      // Step 1: Ensure all files have base64
      const preparedFiles: { name: string; type: string; base64: string }[] = [];

      for (const doc of files) {
        let base64 = doc.base64;
        if (!base64 && doc.file) {
          addLog(`[ENCODE] Reading binary content of ${doc.name}...`);
          try {
            base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(doc.file!);
            });
          } catch {
            // continue
          }
        }

        if (!base64 && doc.previewUrl && doc.previewUrl.startsWith('data:')) {
          base64 = doc.previewUrl;
        }

        if (base64) {
          preparedFiles.push({
            name: doc.name,
            type: doc.type || 'application/pdf',
            base64: base64,
          });
        }
      }

      // Fallback for sample docs
      if (preparedFiles.length === 0) {
        for (const doc of files) {
          preparedFiles.push({
            name: doc.name || 'document.pdf',
            type: doc.type || 'application/pdf',
            base64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><text x="20" y="30">Document Record</text></svg>',
          });
        }
      }

      // Check if user is running test with sample document
      const matchedSample = SAMPLE_DOCS.find((s) =>
        files.some((f) => f.name === s.doc.name || f.id === s.doc.id || f.isSample)
      );

      if (matchedSample && files.length === 1 && files[0].isSample) {
        setCurrentStageIdx(1);
        addLog(`[SAMPLE] Loading pre-extracted verification data for sample document...`);
        setTimeout(() => setCurrentStageIdx(2), 400);
        setTimeout(() => setCurrentStageIdx(3), 800);
        setTimeout(() => {
          setCurrentStageIdx(4);
          const sampleResult = {
            ...matchedSample.mockExtractedData,
            workbookFilename: config.filename,
            extractedAt: new Date().toISOString(),
          };
          onSuccess(sampleResult);
          setTimeout(onComplete, 600);
        }, 1200);
        return;
      }

      // Stage 1: Document analysis
      setCurrentStageIdx(1);
      addLog(`[ANALYSIS] Prepared ${preparedFiles.length} file(s) for extraction.`);

      // Stage 2: OCR Extraction
      setCurrentStageIdx(2);

      const effectiveApiKey = userApiKey.trim() || sessionStorage.getItem('extractx_user_key') || '';

      // High-capacity batch processing:
      // If multiple files, process file-by-file to keep payloads under Vercel's 4.5MB limit
      const extractedWorkbooks: ExtractedWorkbookData[] = [];
      const isMultiFile = preparedFiles.length > 1;

      for (let i = 0; i < preparedFiles.length; i++) {
        const fileBatch = [preparedFiles[i]];
        const currentFile = preparedFiles[i];

        if (isMultiFile) {
          addLog(`[BATCH ${i + 1}/${preparedFiles.length}] Processing "${currentFile.name}"...`);
        } else {
          addLog(`[API] Processing "${currentFile.name}" with multimodal OCR engine...`);
        }

        try {
          const response = await fetch('/api/extract', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(effectiveApiKey ? { 'x-gemini-key': effectiveApiKey } : {}),
            },
            body: JSON.stringify({
              files: fileBatch,
              config: {
                filename: config.filename,
                sheets: config.sheets,
                instructions: config.instructions,
                includeSourceColumn: config.includeSourceColumn !== false,
                customApiKey: effectiveApiKey || undefined,
              },
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const wb = result.data as ExtractedWorkbookData;
              const rowsCount = wb.sheets.reduce((acc, s) => acc + s.rows.length, 0);
              addLog(`  -> "${currentFile.name}": Extracted ${rowsCount} row(s) across ${wb.sheets.length} sheet(s).`);
              extractedWorkbooks.push(wb);
            } else {
              throw new Error(result.error || `Unable to parse data from ${currentFile.name}`);
            }
          } else {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error || `HTTP ${response.status} from extraction server`;

            if (errMsg.includes('GEMINI_API_KEY') || errMsg.includes('API_KEY')) {
              setShowKeyInput(true);
            }
            throw new Error(errMsg);
          }
        } catch (fileErr: any) {
          const errMsg = fileErr.message || String(fileErr);
          addLog(`[NOTICE] "${currentFile.name}" extraction note: ${errMsg}`);

          if (errMsg.includes('GEMINI_API_KEY')) {
            setShowKeyInput(true);
            setError(
              'Gemini API key is not configured on your server/Vercel instance. You can enter an API key below to proceed immediately, or configure GEMINI_API_KEY in your Vercel project settings.'
            );
            return;
          }

          // If multi-file, we can attempt to continue with other files or throw
          if (isMultiFile) {
            addLog(`  -> Warning on "${currentFile.name}", continuing with remaining documents...`);
          } else {
            throw fileErr;
          }
        }
      }

      if (extractedWorkbooks.length === 0) {
        throw new Error('No structured records could be extracted from the uploaded files. Please check file readability and retry.');
      }

      // Stage 3: Structuring & Harmonizing
      setCurrentStageIdx(3);
      addLog(`[HARMONIZE] Consolidating records across ${extractedWorkbooks.length} document(s)...`);

      const finalWorkbook: ExtractedWorkbookData = mergeExtractedWorkbooks(
        extractedWorkbooks,
        config.filename,
        config.includeSourceColumn !== false && files.length > 1
      );

      const totalRows = finalWorkbook.sheets.reduce((acc, s) => acc + s.rows.length, 0);
      addLog(`[SUCCESS] Consolidated ${finalWorkbook.sheets.length} sheet(s) with ${totalRows} total rows.`);
      if (finalWorkbook.engineUsed) {
        addLog(`[ENGINE] ${finalWorkbook.engineUsed}`);
      }

      // Stage 4: Confidence verification
      setCurrentStageIdx(4);
      addLog(`[VERIFY] Overall confidence score: ${(finalWorkbook.overallConfidence * 100).toFixed(1)}%`);
      if (finalWorkbook.warningsCount > 0) {
        addLog(`[WARNING] Flagged ${finalWorkbook.warningsCount} low-confidence cell(s) for manual inspection.`);
      }

      onSuccess(finalWorkbook);

      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err: any) {
      console.error('Batch extraction error:', err);
      setError(err.message || 'An error occurred during document extraction.');
      addLog(`[ERROR] ${err.message || 'Extraction failed'}`);
    }
  };

  useEffect(() => {
    if (!extractionStartedRef.current) {
      extractionStartedRef.current = true;
      executeExtraction();
    }
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    executeExtraction().finally(() => setIsRetrying(false));
  };

  const handleSaveApiKeyAndRetry = () => {
    if (userApiKey.trim()) {
      sessionStorage.setItem('extractx_user_key', userApiKey.trim());
      setShowKeyInput(false);
      setError(null);
      handleRetry();
    }
  };

  const handleFallback = () => {
    const sheetsToUse =
      config.sheets.length > 0
        ? config.sheets
        : [{ id: 'sheet-1', name: 'Extracted Data', columns: ['Field 1', 'Field 2', 'Field 3', 'Value'] }];

    const fallbackSheets = sheetsToUse.map((sheet) => {
      const fallbackRow: Record<string, { value: string; confidence: number; flagged?: boolean; warningNote?: string }> = {};
      sheet.columns.forEach((col) => {
        fallbackRow[col] = {
          value: '',
          confidence: 0.9,
          flagged: true,
          warningNote: 'Empty record created for manual transcription',
        };
      });
      return {
        sheetId: sheet.id,
        sheetName: sheet.name,
        columns: sheet.columns,
        rows: [fallbackRow],
      };
    });

    const fallbackWorkbook: ExtractedWorkbookData = {
      workbookFilename: config.filename,
      sheets: fallbackSheets,
      overallConfidence: 0.85,
      extractedAt: new Date().toISOString(),
      warningsCount: sheetsToUse.length,
      engineUsed: 'Manual Transcription Grid',
    };

    onSuccess(fallbackWorkbook);
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Cpu className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900">
            Processing {files.length} Document{files.length > 1 ? 's' : ''}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Running high-capacity multimodal OCR, schema routing &amp; sheet consolidation.
          </p>
        </div>

        {/* API Key Prompt (Helpful for Vercel users who haven't added env vars yet) */}
        {showKeyInput && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold">Vercel Deployment Notice: Gemini API Key</h4>
                <p className="text-xs text-blue-800 mt-1">
                  If you deployed to Vercel, configure <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">GEMINI_API_KEY</code> in your Vercel Project Settings &gt; Environment Variables. Alternatively, enter your key below to continue testing immediately:
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiKeyAndRetry}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                  >
                    Save &amp; Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error display if extraction failed */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-950">Extraction Status Notice</h4>
                <p className="text-xs text-red-800 mt-1">{error}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>Retry Extraction</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFallback}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-red-300 hover:bg-red-50 text-red-900 transition-colors"
                  >
                    <span>Proceed to Review Grid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Stages Display */}
        <div className="space-y-4 mb-8">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx && !error;
            const isPending = idx > currentStageIdx;

            return (
              <div
                key={stage.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-50 border-slate-900 shadow-2xs'
                    : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                    : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isCurrent && <Loader2 className="w-5 h-5 text-slate-900 animate-spin shrink-0" />}
                  {isPending && <Circle className="w-5 h-5 text-neutral-300 shrink-0" />}

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-slate-900'
                          : isCompleted
                          ? 'text-emerald-900'
                          : 'text-neutral-500'
                      }`}
                    >
                      {stage.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">{stage.detail}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white/80 border border-neutral-200">
                  {isCompleted ? '✓ Done' : isCurrent ? '● Processing' : '○ Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Execution Logs */}
        <div className="border border-neutral-200 bg-neutral-900 text-neutral-200 rounded-xl p-3.5 font-mono text-[11px] leading-relaxed mb-6">
          <div className="text-neutral-400 text-[10px] uppercase tracking-wider mb-1.5 pb-1 border-b border-neutral-800 flex justify-between">
            <span>Pipeline Execution Log</span>
            <span>Batch Progress</span>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-neutral-300">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">OCR Verification Protocol: </span>
            <span>
              ExtractX validates all rows and columns across documents. You can review, edit, and adjust cells on the interactive grid in the next step before generating the final Excel file.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

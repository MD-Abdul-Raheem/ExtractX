import React, { useRef, useState } from 'react';
import { UploadedDoc, ConversionHistoryItem } from '../types';
import { validateFile, formatBytes } from '../utils/fileValidation';
import { optimizeImageFile } from '../utils/imageOptimizer';
import { SAMPLE_DOCS } from '../data/sampleDocuments';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  Plus,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Zap
} from 'lucide-react';

interface UploadStepProps {
  files: UploadedDoc[];
  onFilesChange: (files: UploadedDoc[]) => void;
  onContinue: () => void;
  onLoadSample: (sampleIndex?: number) => void;
  history: ConversionHistoryItem[];
  onReopenHistory?: (item: ConversionHistoryItem) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  files,
  onFilesChange,
  onContinue,
  onLoadSample,
  history,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReadingFiles, setIsReadingFiles] = useState(false);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      const validation = validateFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file detected.');
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsReadingFiles(true);
    try {
      const getMimeType = (file: File) => {
        if (file.type && file.type !== 'application/octet-stream') {
          return file.type;
        }
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'application/pdf';
        if (ext === 'png') return 'image/png';
        if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
        if (ext === 'webp') return 'image/webp';
        return file.type || 'application/pdf';
      };

      const loadedDocs: UploadedDoc[] = await Promise.all(
        validFiles.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          const detectedMime = getMimeType(file);

          // If image, optimize and compress to reduce payload and memory consumption
          const isImg = detectedMime.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);
          let base64 = '';
          let finalSize = file.size;
          let wasOptimized = false;

          if (isImg && !detectedMime.includes('svg')) {
            const optResult = await optimizeImageFile(file);
            base64 = optResult.base64;
            finalSize = optResult.optimizedSize;
            wasOptimized = optResult.wasOptimized;
          } else {
            base64 = await readFileAsBase64(file);
          }

          return {
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            name: file.name,
            size: finalSize,
            originalSize: file.size,
            wasOptimized,
            type: detectedMime,
            lastModified: file.lastModified,
            previewUrl,
            pageCount: detectedMime.includes('pdf') ? 1 : undefined,
            base64,
            file,
          };
        })
      );
      onFilesChange([...files, ...loadedDocs]);
    } catch (err: any) {
      setErrorMessage(`Failed to read file contents: ${err.message || 'Unknown error'}`);
    } finally {
      setIsReadingFiles(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    onFilesChange([]);
  };

  const totalSize = files.reduce((acc, curr) => acc + curr.size, 0);
  const pdfCount = files.filter((f) => f.type.includes('pdf')).length;
  const imageCount = files.length - pdfCount;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Professional Document Processing & Extraction</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
          ExtractX
        </h1>
        <p className="mt-2 text-base text-neutral-600">
          Convert documents and scanned records into structured Excel files with custom sheets, headers, and full manual review.
        </p>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">File Validation Notice</p>
            <p className="mt-0.5 text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Upload Area */}
      <div
        id="drop-zone-area"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-white ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
            : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />

        {isReadingFiles ? (
          <div className="py-6">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-2 border-slate-900 border-t-transparent mb-3" />
            <p className="text-sm font-semibold text-slate-900">Processing &amp; Optimizing documents...</p>
            <p className="text-xs text-neutral-500 mt-1">Applying high-fidelity compression &amp; layout prep for multi-file OCR</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 mb-4 border border-neutral-200">
              <UploadCloud className="w-7 h-7 text-neutral-700" />
            </div>

            <h3 className="text-lg font-semibold text-neutral-900">
              Upload multiple images &amp; PDFs at once
            </h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">
              Drag &amp; drop your receipts, invoices, bank statements, and scanned tables here. Batch-processing supports up to 30 files.
            </p>
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
          <span className="px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200">Multiple PDFs</span>
          <span className="px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200">PNG / JPG / WEBP</span>
          <span className="text-neutral-400">•</span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            ⚡ High Capacity Batch Mode
          </span>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 transition-colors shadow-xs"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Select Multiple Files</span>
          </button>
        </div>
      </div>

      {/* Quick Test with Realistic Sample */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">
              Want to test the full pipeline immediately?
            </p>
            <p className="text-xs text-slate-600">
              Load our pre-configured Q3 Customer &amp; Settlement Statement sample PDF with multi-table extraction.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-load-sample-doc"
          onClick={() => onLoadSample(0)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Load Sample Document</span>
        </button>
      </div>

      {/* Selected Files List (Upload State) */}
      {files.length > 0 && (
        <div id="selected-files-container" className="mt-8 bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-neutral-900">
                  Selected Documents ({files.length})
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {pdfCount > 0 ? `${pdfCount} PDF${pdfCount > 1 ? 's' : ''}` : ''}
                  {pdfCount > 0 && imageCount > 0 ? ', ' : ''}
                  {imageCount > 0 ? `${imageCount} Image${imageCount > 1 ? 's' : ''}` : ''}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Total batch size: {formatBytes(totalSize)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden max-h-[380px] overflow-y-auto">
            {files.map((file) => {
              const isPdf = file.type.includes('pdf');
              return (
                <div
                  key={file.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-white hover:bg-neutral-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                      {isPdf ? (
                        <FileText className="w-5 h-5 text-red-600" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-neutral-900 truncate max-w-[280px] sm:max-w-md">
                          {file.name}
                        </p>
                        {file.isSample && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            Sample
                          </span>
                        )}
                        {file.wasOptimized && file.originalSize && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                            <Zap className="w-2.5 h-2.5" />
                            <span>Optimized ({formatBytes(file.originalSize)} → {formatBytes(file.size)})</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {isPdf ? 'PDF Document' : 'Image File'} • {formatBytes(file.size)}
                        {file.pageCount ? ` • ${file.pageCount} page(s)` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    className="text-neutral-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Continue button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              id="btn-continue-to-config"
              onClick={onContinue}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-xs"
            >
              <span>Configure Excel Structure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Conversions Section */}
      {history && history.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-neutral-500" />
            <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
              Recent Conversions
            </h4>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {item.filename}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.sheetsCount} sheets • {item.totalRows} extracted rows • {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-neutral-400 font-mono">
                  {item.fileNames[0] || 'Document'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

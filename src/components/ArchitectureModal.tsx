import React from 'react';
import { Layers, CheckCircle2, Server, Cpu, FileSpreadsheet, X, ShieldCheck } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-xl border border-neutral-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900">
                ExtractX Architecture Plan
              </h3>
              <p className="text-xs text-neutral-500">
                Full-Stack System Design &amp; Processing Boundary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
          {/* Module 1: Frontend Layer */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-2">
              <Server className="w-4 h-4 text-slate-800" />
              <span>1. Frontend UI &amp; State Shell (Next.js / Vite React)</span>
            </div>
            <p className="mb-2">
              Responsive SaaS UI built with TypeScript and Tailwind CSS.
            </p>
            <ul className="space-y-1 list-disc list-inside text-neutral-700">
              <li><strong>Interactive Document Preview:</strong> Zoom, pan, and OCR bounding box projection.</li>
              <li><strong>Interactive Spreadsheet Grid:</strong> Cell editing, row addition/deletion, column management, search filtering.</li>
              <li><strong>Client-Side Verification:</strong> Immediate validation of file formats, sizes, and cell modifications before export.</li>
            </ul>
          </div>

          {/* Module 2: Backend & OCR Processing Boundary */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-2">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>2. Python FastAPI &amp; Document Processing Layer</span>
            </div>
            <p className="mb-2">
              Decoupled service boundary capable of running as a dedicated background worker or container to prevent serverless timeout limitations.
            </p>
            <ul className="space-y-1 list-disc list-inside text-neutral-700">
              <li><strong>PyMuPDF (fitz):</strong> Direct digital vector text and embedded table extraction from native PDFs without raster loss.</li>
              <li><strong>Tesseract OCR:</strong> Optical character recognition with language models for scanned documents and images.</li>
              <li><strong>OCRmyPDF:</strong> PDF text-layer creation for scanned non-searchable PDFs.</li>
              <li><strong>Pillow / OpenCV:</strong> Image preprocessing (grayscale conversion, Otsu thresholding, skew correction, noise reduction).</li>
            </ul>
          </div>

          {/* Module 3: Excel Generation Layer */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>3. Excel Generation Engine (openpyxl &amp; OpenXML)</span>
            </div>
            <p className="mb-2">
              Generates genuine, standards-compliant multi-sheet .xlsx workbooks.
            </p>
            <ul className="space-y-1 list-disc list-inside text-neutral-700">
              <li>Automatic column width calculation to prevent <code>###</code> clipping.</li>
              <li>Explicit numeric typing for amounts, quantities, IDs, and dates.</li>
              <li>UTF-8 text preservation and strict Excel sheet name sanitization (max 31 characters, no forbidden characters).</li>
            </ul>
          </div>

          {/* Security & Production Boundaries */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Security &amp; Ephemeral Processing</span>
            </div>
            <p className="text-[11px] text-emerald-900">
              No permanent storage of user documents. Uploaded files are processed in ephemeral memory or sanitized temporary directories and unlinked immediately upon extraction completion.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
          >
            Close Plan
          </button>
        </div>
      </div>
    </div>
  );
};

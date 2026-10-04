import React from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">
                Extraction &amp; OCR Accuracy Policy
              </h3>
              <p className="text-xs text-neutral-500">
                Official Production Notice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-neutral-600 space-y-3 leading-relaxed">
          <p className="font-semibold text-neutral-900">
            ExtractX does not claim OCR is 100% accurate.
          </p>
          <p>
            Real-world documents vary drastically in scan dpi, camera skew, smudges, font weights, and layout density. Machine optical recognition can mistake characters (e.g. "S" vs "$", "O" vs "0", "l" vs "1").
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <p className="font-bold text-neutral-800">Our 5-Stage Accuracy Safeguards:</p>
            <ul className="space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Document Preprocessing:</strong> Bilateral filtering, thresholding, and deskewing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Layered OCR:</strong> Direct vector extraction for digital PDFs; high-resolution OCR for scanned images.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Confidence Scoring:</strong> Individual cell confidence flags warn users of uncertain tokens.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Mandatory Human-in-the-Loop Review:</strong> Direct side-by-side editing before generating final Excel.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

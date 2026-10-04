import React from 'react';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  onOpenArchPlan?: () => void;
  onOpenDisclaimer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div
            id="brand-logo-container"
            className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs cursor-pointer"
            onClick={onReset}
            title="ExtractX Home"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                id="brand-title"
                className="font-bold text-lg text-neutral-900 tracking-tight cursor-pointer"
                onClick={onReset}
              >
                ExtractX
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                Data To Excel
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block">
              Convert documents into structured Excel files
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="nav-reset-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
            title="Start New Conversion"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
            <span>New File</span>
          </button>
        </div>
      </div>
    </header>
  );
};

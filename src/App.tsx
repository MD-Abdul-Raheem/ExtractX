/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppStep,
  UploadedDoc,
  WorkbookConfig,
  ExtractedWorkbookData,
  ConversionHistoryItem,
} from './types';
import { SAMPLE_DOCS } from './data/sampleDocuments';
import { Navbar } from './components/Navbar';
import { StepIndicator } from './components/StepIndicator';
import { UploadStep } from './components/UploadStep';
import { ConfigStep } from './components/ConfigStep';
import { ProcessingStep } from './components/ProcessingStep';
import { ReviewStep } from './components/ReviewStep';
import { ExportStep } from './components/ExportStep';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ArchitectureModal } from './components/ArchitectureModal';

const DEFAULT_CONFIG: WorkbookConfig = {
  filename: 'extracted_records.xlsx',
  sheets: [],
  instructions:
    'Auto-detect all document sections, tables, headers, line items, and key-value summaries. Faithfully extract all rows into relevant sheets with clear column headers.',
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([]);
  const [files, setFiles] = useState<UploadedDoc[]>([]);
  const [config, setConfig] = useState<WorkbookConfig>(DEFAULT_CONFIG);
  const [extractedData, setExtractedData] = useState<ExtractedWorkbookData>(
    SAMPLE_DOCS[0].mockExtractedData
  );
  const [activeSampleIndex, setActiveSampleIndex] = useState<number>(0);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('extractx_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleFilesChange = (newFiles: UploadedDoc[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0 && !newFiles[0].isSample) {
      const baseName = newFiles[0].name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      setConfig((prev) => ({
        ...prev,
        filename: `${baseName || 'extracted_records'}.xlsx`,
        ...(prev.instructions.includes('Put customer information in Customers') || prev.sheets.length === 0
          ? {
              sheets: [],
              instructions:
                'Auto-detect all document sections, tables, headers, line items, and key-value summaries. Faithfully extract all rows into relevant sheets with clear column headers.',
            }
          : {}),
      }));
    }
  };

  const saveHistoryRecord = (dataToRecord: ExtractedWorkbookData) => {
    const totalRows = dataToRecord.sheets.reduce((acc, s) => acc + s.rows.length, 0);
    const newRecord: ConversionHistoryItem = {
      id: `conv-${Date.now()}`,
      filename: dataToRecord.workbookFilename,
      sheetsCount: dataToRecord.sheets.length,
      totalRows,
      timestamp: Date.now(),
      fileNames: files.map((f) => f.name),
    };
    const updated = [newRecord, ...history.slice(0, 9)];
    setHistory(updated);
    try {
      localStorage.setItem('extractx_history', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLoadSample = (sampleIdx = 0) => {
    const sample = SAMPLE_DOCS[sampleIdx] || SAMPLE_DOCS[0];
    const encoded = typeof window !== 'undefined'
      ? 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(sample.svgPreview.replace('data:image/svg+xml;utf8,', ''))))
      : sample.svgPreview;

    setFiles([
      {
        ...sample.doc,
        previewUrl: sample.svgPreview,
        base64: encoded,
      },
    ]);
    setConfig(sample.defaultConfig);
    setExtractedData(sample.mockExtractedData);
    setActiveSampleIndex(sampleIdx);
  };

  const handleContinueToConfig = () => {
    if (files.length === 0) return;
    if (!completedSteps.includes('upload')) {
      setCompletedSteps([...completedSteps, 'upload']);
    }
    setCurrentStep('config');
  };

  const handleStartExtraction = () => {
    if (!completedSteps.includes('config')) {
      setCompletedSteps([...completedSteps, 'config']);
    }
    setCurrentStep('processing');
  };

  const handleProcessingComplete = () => {
    if (!completedSteps.includes('processing')) {
      setCompletedSteps([...completedSteps, 'processing']);
    }
    setCurrentStep('review');
  };

  const handleContinueToExport = () => {
    if (!completedSteps.includes('review')) {
      setCompletedSteps([...completedSteps, 'review']);
    }
    saveHistoryRecord(extractedData);
    setCurrentStep('export');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setCompletedSteps([]);
    setFiles([]);
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/70 text-neutral-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        onReset={handleReset}
        onOpenArchPlan={() => setIsArchModalOpen(true)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      {/* Linear Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Main Step Views */}
      <main className="flex-1">
        {currentStep === 'upload' && (
          <UploadStep
            files={files}
            onFilesChange={handleFilesChange}
            onContinue={handleContinueToConfig}
            onLoadSample={handleLoadSample}
            history={history}
          />
        )}

        {currentStep === 'config' && (
          <ConfigStep
            config={config}
            onChangeConfig={setConfig}
            onBack={() => setCurrentStep('upload')}
            onStartExtraction={handleStartExtraction}
            files={files}
          />
        )}

        {currentStep === 'processing' && (
          <ProcessingStep
            files={files}
            config={config}
            onSuccess={(data) => setExtractedData(data)}
            onComplete={handleProcessingComplete}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            data={extractedData}
            files={files}
            activeDoc={files[0] || null}
            svgPreview={
              files.some((f) => f.isSample)
                ? SAMPLE_DOCS[activeSampleIndex]?.svgPreview
                : undefined
            }
            onDataChange={setExtractedData}
            onBack={() => setCurrentStep('config')}
            onContinueToExport={handleContinueToExport}
          />
        )}

        {currentStep === 'export' && (
          <ExportStep
            data={extractedData}
            onConvertAnother={handleReset}
            onBackToReview={() => setCurrentStep('review')}
          />
        )}
      </main>

      {/* Production Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 px-4 sm:px-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">ExtractX</span>
            <span>•</span>
            <span>Production Document to Excel Conversion Utility</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="hover:text-neutral-800 transition-colors"
            >
              OCR Accuracy Policy
            </button>
            <button
              onClick={() => setIsArchModalOpen(true)}
              className="hover:text-neutral-800 transition-colors"
            >
              System Architecture
            </button>
            <span>v1.0.0-prod</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}

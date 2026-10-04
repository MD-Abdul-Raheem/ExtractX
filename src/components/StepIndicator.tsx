import React from 'react';
import { AppStep } from '../types';
import { Upload, Settings2, Cpu, CheckCircle2, Download } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
  onStepClick?: (step: AppStep) => void;
  completedSteps: AppStep[];
}

const STEPS: { id: AppStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'upload', label: '1. Upload', icon: Upload },
  { id: 'config', label: '2. Configure Excel', icon: Settings2 },
  { id: 'processing', label: '3. Extract Data', icon: Cpu },
  { id: 'review', label: '4. Review & Edit', icon: CheckCircle2 },
  { id: 'export', label: '5. Export Excel', icon: Download },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  completedSteps,
}) => {
  return (
    <div className="w-full bg-white border-b border-neutral-200 py-3.5 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4">
        {STEPS.map((step, idx) => {
          const isCurrent = currentStep === step.id;
          const isDone = completedSteps.includes(step.id);
          const isClickable = isDone && !isCurrent && onStepClick;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div
                id={`step-indicator-${step.id}`}
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.id);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isDone
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                    : 'text-neutral-400 bg-neutral-50'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isCurrent
                      ? 'text-emerald-400'
                      : isDone
                      ? 'text-emerald-600'
                      : 'text-neutral-400'
                  }`}
                />
                <span>{step.label}</span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-4 max-w-12 sm:max-w-16 ${
                    isDone ? 'bg-emerald-300' : 'bg-neutral-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

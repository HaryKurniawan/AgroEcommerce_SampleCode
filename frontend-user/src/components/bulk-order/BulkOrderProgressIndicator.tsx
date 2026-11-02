"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface BulkOrderProgressIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const BulkOrderProgressIndicator: React.FC<
  BulkOrderProgressIndicatorProps
> = ({ currentStep, steps }) => {
  return (
    <div className="flex justify-center mb-5">
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl px-5 py-2.5">
        {steps.map((stepLabel, i) => {
          const stepNum = i + 1;
          const isActive = currentStep === stepNum;
          const isPast = currentStep > stepNum;
          return (
            <React.Fragment key={stepLabel}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${isActive || isPast ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {isPast ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`text-xs font-semibold hidden md:block ${isActive || isPast ? "text-gray-900" : "text-gray-400"}`}
                >
                  {stepLabel}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-6 md:w-10 h-px mx-1 md:mx-3 transition-all duration-300 ${isPast ? "bg-primary-600" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

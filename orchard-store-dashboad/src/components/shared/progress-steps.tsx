"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

export function ProgressSteps({ currentStep, className }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: "Enter Email" },
    { number: 2, label: "Verify OTP" },
    { number: 3, label: "Reset Password" },
  ];

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isPending = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted &&
                      "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-800/30",
                    isCurrent &&
                      "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-800/30 ring-4 ring-slate-800/20",
                    isPending && "bg-white border-slate-300 text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                {/* Step Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors",
                    isCurrent || isCompleted
                      ? "text-slate-700"
                      : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-all duration-300",
                    currentStep > step.number ? "bg-slate-700" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

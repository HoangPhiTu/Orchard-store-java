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
                      "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30",
                    isCurrent &&
                      "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20",
                    isPending && "bg-background border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-base font-bold">{step.number}</span>
                  )}
                </div>
                {/* Step Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors",
                    isCurrent || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
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
                    currentStep > step.number ? "bg-primary" : "bg-border"
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

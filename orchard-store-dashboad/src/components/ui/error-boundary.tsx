"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage =
        this.state.error?.message || "An unexpected error occurred";

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Something went wrong
          </h3>

          <p className="mb-4 max-w-md text-sm text-muted-foreground">
            {errorMessage}
          </p>

          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="outline">
              Try Again
            </Button>
            <Button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4 w-full max-w-xl text-left text-xs">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-[11px] leading-relaxed">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

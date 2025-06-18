"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoadingErrorProps {
  error: Error | null;
  isLoading?: boolean;
  onRetry?: () => void;
  context?: string;
  className?: string;
}

const LoadingError: React.FC<LoadingErrorProps> = ({
  error,
  isLoading = false,
  onRetry,
  context,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={`max-w-md mx-auto mt-8 ${className || ""}`}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Loading {context || "data"}...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!error) return null;

  return (
    <Card className={`max-w-md mx-auto mt-8 ${className || ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Error Loading {context || "Data"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred while loading data."}
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="text-xs bg-muted p-2 rounded">
            <summary className="cursor-pointer font-medium">
              Error Details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap overflow-auto text-xs">
              {error.stack || error.toString()}
            </pre>
          </details>
        )}

        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LoadingError;

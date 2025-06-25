"use client";

import React, { ReactNode } from "react";
import EnhancedErrorBoundary from "./EnhancedErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName: string;
}

const PageErrorFallback: React.FC<{
  error: Error;
  context: Record<string, unknown>;
  onRetry: () => void;
  pageName: string;
}> = ({ error, onRetry, pageName }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="max-w-2xl w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive text-xl">
          <AlertTriangle className="h-6 w-6" />
          {pageName} Page Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            We encountered an unexpected error while loading the {pageName.toLowerCase()} page.
          </p>
          <p className="text-sm text-muted-foreground">
            This might be a temporary issue. Please try refreshing the page or return to the home page.
            If the problem persists, please contact support.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-xs bg-muted p-4 rounded">
            <summary className="cursor-pointer font-medium text-center">
              Developer Information
            </summary>
            <pre className="mt-4 whitespace-pre-wrap overflow-auto">
              <strong>Error:</strong> {error.message}
              {error.stack && (
                <>
                  {'\n\n'}<strong>Stack Trace:</strong>{'\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={onRetry} variant="outline" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="default" 
            size="lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ 
  children, 
  pageName 
}) => {
  return (
    <EnhancedErrorBoundary
      featureName={pageName}
      level="page"
      enableReporting={true}
      showErrorDetails={process.env.NODE_ENV === 'development'}
      fallback={(props) => <PageErrorFallback {...props} pageName={pageName} />}
      onError={(error, errorInfo, context) => {
        // Page-level error handling
        console.error(`Page ${pageName} error:`, {
          error: error.message,
          page: pageName,
          context,
        });
        
        // Could send to analytics or error tracking service
        // analytics.track('Page Error', { pageName, error: error.message });
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
};

export default PageErrorBoundary;
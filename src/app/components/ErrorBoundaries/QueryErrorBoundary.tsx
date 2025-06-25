"use client";

import React, { ReactNode } from "react";
import EnhancedErrorBoundary from "./EnhancedErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface QueryErrorBoundaryProps {
  children: ReactNode;
  queryName: string;
  refetch?: () => void;
  onQueryError?: (error: Error, queryName: string) => void;
}

const QueryErrorFallback: React.FC<{
  error: Error;
  context: Record<string, unknown>;
  onRetry: () => void;
  queryName: string;
  refetch?: () => void;
}> = ({ error, onRetry, queryName, refetch }) => {
  const isNetworkError = error.message.toLowerCase().includes('network') || 
                        error.message.toLowerCase().includes('fetch') ||
                        error.message.toLowerCase().includes('connection');

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          {isNetworkError ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          {isNetworkError ? 'Connection Error' : 'Data Loading Error'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-600 mb-4">
          {isNetworkError 
            ? 'Unable to connect to the server. Please check your internet connection and try again.'
            : `Failed to load ${queryName.toLowerCase()} data. This might be a temporary issue.`
          }
        </p>
        
        {isNetworkError && (
          <div className="bg-blue-100 p-3 rounded text-xs text-blue-700 mb-4 flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span>Check your connection and try again in a moment.</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={refetch || onRetry} 
            variant="outline" 
            size="sm" 
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {refetch ? 'Retry Query' : 'Reload'}
          </Button>
          
          {!refetch && (
            <Button 
              onClick={onRetry} 
              variant="default" 
              size="sm"
            >
              Reset Component
            </Button>
          )}
        </div>
        
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-xs bg-blue-100 p-2 rounded">
            <summary className="cursor-pointer font-medium text-blue-800">
              Query Error Details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap overflow-auto text-blue-700">
              <strong>Query:</strong> {queryName}
              {'\n\n'}<strong>Error:</strong> {error.toString()}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({ 
  children, 
  queryName,
  refetch,
  onQueryError
}) => {
  return (
    <EnhancedErrorBoundary
      featureName={`${queryName} Query`}
      level="component"
      enableReporting={true}
      fallback={(props) => (
        <QueryErrorFallback {...props} queryName={queryName} refetch={refetch} />
      )}
      onError={(error, errorInfo, context) => {
        // Query-specific error handling
        console.error(`Query ${queryName} error:`, {
          error: error.message,
          query: queryName,
          context,
        });
        
        if (onQueryError) {
          onQueryError(error, queryName);
        }
        
        // Could send to analytics or error tracking service
        // analytics.track('Query Error', { queryName, error: error.message });
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
};

export default QueryErrorBoundary;
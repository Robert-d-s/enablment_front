"use client";

import React, { ReactNode } from "react";
import EnhancedErrorBoundary from "./EnhancedErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AdminFeatureBoundaryProps {
  children: ReactNode;
  featureName: string;
}

const AdminFeatureFallback: React.FC<{
  error: Error;
  context: Record<string, unknown>;
  onRetry: () => void;
  featureName: string;
}> = ({ error, onRetry, featureName }) => (
  <Card className="bg-red-50 border-red-200 mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        {featureName} Unavailable
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-red-600 mb-4">
        The {featureName.toLowerCase()} feature encountered an error and is temporarily unavailable. 
        Other admin features should continue to work normally.
      </p>
      <Button 
        onClick={onRetry} 
        variant="outline" 
        size="sm" 
        className="text-red-700 border-red-300 hover:bg-red-100"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reload {featureName}
      </Button>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-xs bg-red-100 p-2 rounded">
          <summary className="cursor-pointer font-medium text-red-800">
            Error Details
          </summary>
          <pre className="mt-2 whitespace-pre-wrap overflow-auto text-red-700">
            {error.toString()}
          </pre>
        </details>
      )}
    </CardContent>
  </Card>
);

const AdminFeatureBoundary: React.FC<AdminFeatureBoundaryProps> = ({ 
  children, 
  featureName 
}) => {
  return (
    <EnhancedErrorBoundary
      featureName={featureName}
      level="feature"
      enableReporting={true}
      fallback={(props) => <AdminFeatureFallback {...props} featureName={featureName} />}
      onError={(error, errorInfo, context) => {
        // Admin-specific error handling
        console.error(`Admin feature ${featureName} error:`, {
          error: error.message,
          feature: featureName,
          context,
        });
        
        // Could send to analytics or error tracking service
        // analytics.track('Admin Feature Error', { featureName, error: error.message });
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
};

export default AdminFeatureBoundary;
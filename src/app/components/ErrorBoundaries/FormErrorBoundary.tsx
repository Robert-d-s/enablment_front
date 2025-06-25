"use client";

import React, { ReactNode } from "react";
import EnhancedErrorBoundary from "./EnhancedErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface FormErrorBoundaryProps {
  children: ReactNode;
  formName: string;
  onFormError?: (error: Error, formName: string) => void;
}

const FormErrorFallback: React.FC<{
  error: Error;
  context: Record<string, unknown>;
  onRetry: () => void;
  formName: string;
}> = ({ error, onRetry, formName }) => (
  <Card className="bg-orange-50 border-orange-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-orange-700">
        <AlertTriangle className="h-5 w-5" />
        Form Error
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-orange-600 mb-4">
        The {formName.toLowerCase()} form encountered an error. Your data may not have been saved.
        Please try again or refresh the page.
      </p>
      
      <div className="bg-orange-100 p-3 rounded text-xs text-orange-700 mb-4">
        <strong>Tip:</strong> If you had filled out the form, you may want to copy any unsaved data before retrying.
      </div>
      
      <Button 
        onClick={onRetry} 
        variant="outline" 
        size="sm" 
        className="text-orange-700 border-orange-300 hover:bg-orange-100"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset Form
      </Button>
      
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-xs bg-orange-100 p-2 rounded">
          <summary className="cursor-pointer font-medium text-orange-800">
            Error Details
          </summary>
          <pre className="mt-2 whitespace-pre-wrap overflow-auto text-orange-700">
            {error.toString()}
          </pre>
        </details>
      )}
    </CardContent>
  </Card>
);

const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({ 
  children, 
  formName,
  onFormError
}) => {
  return (
    <EnhancedErrorBoundary
      featureName={formName}
      level="component"
      enableReporting={true}
      fallback={(props) => <FormErrorFallback {...props} formName={formName} />}
      onError={(error, errorInfo, context) => {
        // Form-specific error handling
        console.error(`Form ${formName} error:`, {
          error: error.message,
          form: formName,
          context,
        });
        
        if (onFormError) {
          onFormError(error, formName);
        }
        
        // Could send to analytics or error tracking service
        // analytics.track('Form Error', { formName, error: error.message });
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
};

export default FormErrorBoundary;
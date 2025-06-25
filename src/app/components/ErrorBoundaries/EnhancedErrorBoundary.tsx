"use client";

import React, { Component, ReactNode, ErrorInfo, ComponentType } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { errorReporting } from "@/app/lib/errorReporting";

interface ErrorContext extends Record<string, unknown> {
  featureName?: string;
  userId?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  level: 'page' | 'feature' | 'component';
  sessionId: string;
}

interface Props {
  children: ReactNode;
  featureName?: string;
  fallback?: ComponentType<{ error: Error; context: ErrorContext; onRetry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo, context: ErrorContext) => void;
  level?: 'page' | 'feature' | 'component';
  enableReporting?: boolean;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  context: ErrorContext | null;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, context: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      context: {
        timestamp: Date.now(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        level: 'component',
        sessionId: '',
      }
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context: ErrorContext = {
      ...this.state.context!,
      featureName: this.props.featureName || 'Unknown',
      level: this.props.level || 'component',
      sessionId: this.getSessionId(),
    };

    console.error(`[${this.props.level || 'component'}] ErrorBoundary caught error:`, {
      error,
      errorInfo,
      context,
    });

    // Report to error tracking service
    if (this.props.enableReporting && typeof window !== 'undefined') {
      this.reportError(error, errorInfo, context);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo, context);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo, context: ErrorContext) => {
    // Use the centralized error reporting service
    errorReporting.reportError(error, context, {
      componentStack: errorInfo.componentStack,
      errorBoundaryLevel: this.props.level,
      timestamp: new Date().toISOString(),
    });
  };

  getSessionId = (): string => {
    // Simple session ID generation (in production, use proper session management)
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('error-session-id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('error-session-id', sessionId);
      }
      return sessionId;
    }
    return 'server';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, context: null });
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const CustomFallback = this.props.fallback;
      
      if (CustomFallback && this.state.context) {
        return (
          <CustomFallback 
            error={this.state.error} 
            context={this.state.context}
            onRetry={this.handleRetry}
          />
        );
      }

      const isPageLevel = this.props.level === 'page';
      const isFeatureLevel = this.props.level === 'feature';
      const showDetails = this.props.showErrorDetails ?? (process.env.NODE_ENV === 'development');
      
      return (
        <Card className={`mx-auto mt-8 ${isPageLevel ? 'max-w-2xl' : 'max-w-md'} ${isFeatureLevel ? 'bg-red-50 border-red-200' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isFeatureLevel ? 'text-red-700' : 'text-destructive'}`}>
              <AlertTriangle className="h-5 w-5" />
              {this.props.featureName ? `${this.props.featureName} Error` : 'Something went wrong'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${isFeatureLevel ? 'text-red-600' : 'text-muted-foreground'}`}>
              {isPageLevel 
                ? 'A critical error occurred on this page. Please try refreshing or return to the home page.'
                : isFeatureLevel
                ? `The ${this.props.featureName?.toLowerCase()} feature encountered an error and is temporarily unavailable. Other features should continue to work normally.`
                : 'An error occurred in this section. You can try again or continue using other parts of the application.'
              }
            </p>

            {showDetails && this.state.error && (
              <details className="text-xs bg-muted p-2 rounded">
                <summary className="cursor-pointer font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-auto">
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}<strong>Stack Trace:</strong>{'\n'}
                      {this.state.error.stack}
                    </>
                  )}
                  {this.state.context && (
                    <>
                      {'\n\n'}<strong>Context:</strong>{'\n'}
                      {JSON.stringify(this.state.context, null, 2)}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry} 
                variant="outline" 
                size="sm"
                className={isFeatureLevel ? 'text-red-700 border-red-300 hover:bg-red-100' : ''}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              {isPageLevel ? (
                <Button onClick={this.handleGoHome} variant="default" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              ) : (
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                  size="sm"
                >
                  Refresh Page
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
// Error Reporting Integration
// This provides a centralized error reporting system that can be integrated with services like Sentry, LogRocket, etc.

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  context: {
    featureName?: string;
    userId?: string;
    timestamp: number;
    userAgent: string;
    url: string;
    level: 'page' | 'feature' | 'component';
    sessionId: string;
  };
  metadata?: Record<string, unknown>;
}

interface ErrorReportingConfig {
  enabled: boolean;
  environment: string;
  apiKey?: string;
  endpoint?: string;
  maxReports: number;
  reportingInterval: number;
}

class ErrorReportingService {
  private config: ErrorReportingConfig;
  private reportQueue: ErrorReport[] = [];
  private reportTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      environment: process.env.NODE_ENV || 'development',
      maxReports: 10,
      reportingInterval: 30000, // 30 seconds
      ...config,
    };

    if (this.config.enabled) {
      this.startReportingTimer();
    }
  }

  public reportError(error: Error, context: ErrorReport['context'], metadata?: Record<string, unknown>): void {
    if (!this.config.enabled) {
      console.warn('Error reporting disabled, logging locally:', { error, context, metadata });
      return;
    }

    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context,
      metadata,
    };

    this.addToQueue(report);
  }

  public reportGraphQLError(error: Error, operationName: string, variables?: Record<string, unknown>): void {
    this.reportError(error, {
      featureName: `GraphQL: ${operationName}`,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      level: 'component',
      sessionId: this.getSessionId(),
    }, {
      operationType: 'GraphQL',
      operationName,
      variables,
    });
  }

  public reportNetworkError(error: Error, endpoint: string, method: string = 'GET'): void {
    this.reportError(error, {
      featureName: `Network: ${endpoint}`,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      level: 'component',
      sessionId: this.getSessionId(),
    }, {
      errorType: 'Network',
      endpoint,
      method,
    });
  }

  public reportWebSocketError(error: Error, event: string): void {
    this.reportError(error, {
      featureName: `WebSocket: ${event}`,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      level: 'component',
      sessionId: this.getSessionId(),
    }, {
      errorType: 'WebSocket',
      event,
    });
  }

  private addToQueue(report: ErrorReport): void {
    this.reportQueue.push(report);

    // Limit queue size
    if (this.reportQueue.length > this.config.maxReports) {
      this.reportQueue.shift();
    }

    // Send immediately for critical errors
    if (report.context.level === 'page') {
      this.sendReports();
    }
  }

  private startReportingTimer(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }

    this.reportTimer = setInterval(() => {
      this.sendReports();
    }, this.config.reportingInterval);
  }

  private async sendReports(): Promise<void> {
    if (this.reportQueue.length === 0) {
      return;
    }

    const reportsToSend = [...this.reportQueue];
    this.reportQueue = [];

    try {
      // Send to custom endpoint if configured
      if (this.config.endpoint) {
        await this.sendToCustomEndpoint(reportsToSend);
      }

      // Send to console in development
      if (this.config.environment === 'development') {
        this.logToConsole(reportsToSend);
      }

      // Integration points for third-party services
      await this.sendToThirdPartyServices(reportsToSend);

    } catch (error) {
      console.error('Failed to send error reports:', error);
      // Re-queue failed reports (up to max limit)
      this.reportQueue = reportsToSend.concat(this.reportQueue).slice(0, this.config.maxReports);
    }
  }

  private async sendToCustomEndpoint(reports: ErrorReport[]): Promise<void> {
    if (!this.config.endpoint) return;

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        reports,
        environment: this.config.environment,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private logToConsole(reports: ErrorReport[]): void {
    reports.forEach(report => {
      console.group(`🚨 Error Report [${report.context.level}]`);
      console.error('Message:', report.message);
      console.error('Feature:', report.context.featureName);
      console.error('Context:', report.context);
      if (report.metadata) {
        console.error('Metadata:', report.metadata);
      }
      if (report.stack) {
        console.error('Stack:', report.stack);
      }
      console.groupEnd();
    });
  }

  private async sendToThirdPartyServices(reports: ErrorReport[]): Promise<void> {
    // Integration with Sentry
    if (typeof window !== 'undefined' && (window as unknown as { [key: string]: unknown }).Sentry) {
      reports.forEach(report => {
        ((window as unknown as { [key: string]: unknown }).Sentry as { captureException: (error: Error, options: unknown) => void }).captureException(new Error(report.message), {
          tags: {
            feature: report.context.featureName,
            level: report.context.level,
          },
          contexts: {
            errorReport: report.context,
          },
          extra: report.metadata,
        });
      });
    }

    // Integration with LogRocket
    if (typeof window !== 'undefined' && (window as unknown as { [key: string]: unknown }).LogRocket) {
      reports.forEach(report => {
        ((window as unknown as { [key: string]: unknown }).LogRocket as { captureException: (error: Error) => void }).captureException(new Error(report.message));
      });
    }

    // Integration with custom analytics
    if (typeof window !== 'undefined' && (window as unknown as { [key: string]: unknown }).analytics) {
      reports.forEach(report => {
        ((window as unknown as { [key: string]: unknown }).analytics as { track: (event: string, properties: unknown) => void }).track('Error Boundary Triggered', {
          feature: report.context.featureName,
          level: report.context.level,
          message: report.message,
          ...report.metadata,
        });
      });
    }
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('error-session-id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('error-session-id', sessionId);
      }
      return sessionId;
    }
    return 'server';
  }

  public configure(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled && !this.reportTimer) {
      this.startReportingTimer();
    } else if (!this.config.enabled && this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
  }

  public destroy(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
    this.sendReports(); // Send any remaining reports
  }
}

// Global error reporting instance
export const errorReporting = new ErrorReportingService({
  enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_ERROR_REPORTING === 'true',
  environment: process.env.NODE_ENV || 'development',
  endpoint: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT,
  apiKey: process.env.NEXT_PUBLIC_ERROR_REPORTING_API_KEY,
});

// Utility functions for common error reporting scenarios
export const reportComponentError = (error: Error, componentName: string, metadata?: Record<string, unknown>) => {
  errorReporting.reportError(error, {
    featureName: componentName,
    timestamp: Date.now(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    url: typeof window !== 'undefined' ? window.location.href : '',
    level: 'component',
    sessionId: errorReporting['getSessionId'](),
  }, metadata);
};

export const reportFeatureError = (error: Error, featureName: string, metadata?: Record<string, unknown>) => {
  errorReporting.reportError(error, {
    featureName,
    timestamp: Date.now(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    url: typeof window !== 'undefined' ? window.location.href : '',
    level: 'feature',
    sessionId: errorReporting['getSessionId'](),
  }, metadata);
};

export const reportPageError = (error: Error, pageName: string, metadata?: Record<string, unknown>) => {
  errorReporting.reportError(error, {
    featureName: pageName,
    timestamp: Date.now(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    url: typeof window !== 'undefined' ? window.location.href : '',
    level: 'page',
    sessionId: errorReporting['getSessionId'](),
  }, metadata);
};

// Global error handlers
if (typeof window !== 'undefined') {
  // Catch unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    errorReporting.reportError(event.error || new Error(event.message), {
      featureName: 'Global Error Handler',
      timestamp: Date.now(),
      userAgent: window.navigator.userAgent,
      url: window.location.href,
      level: 'page',
      sessionId: errorReporting['getSessionId'](),
    }, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorReporting.reportError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        featureName: 'Unhandled Promise Rejection',
        timestamp: Date.now(),
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        level: 'page',
        sessionId: errorReporting['getSessionId'](),
      }
    );
  });
}

export default errorReporting;
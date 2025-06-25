// Performance Monitoring Utility
// Provides tools for monitoring bundle size, component render times, and web vitals

import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'bundle' | 'render' | 'navigation' | 'vitals' | 'custom';
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'development' || 
                   process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true';
    
    if (this.enabled && typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeBundleAnalysis();
    }
  }

  private initializeWebVitals(): void {
    // Monitor Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entry: PerformanceEntry) => {
      this.recordMetric({
        name: 'LCP',
        value: (entry as unknown as { value: number }).value,
        timestamp: Date.now(),
        type: 'vitals',
        metadata: { element: (entry as unknown as { element?: { tagName?: string } }).element?.tagName },
      });
    });

    // Monitor First Input Delay (FID)
    this.observeMetric('first-input', (entry: PerformanceEntry) => {
      this.recordMetric({
        name: 'FID',
        value: (entry as unknown as { processingStart: number }).processingStart - entry.startTime,
        timestamp: Date.now(),
        type: 'vitals',
        metadata: { eventType: entry.name },
      });
    });

    // Monitor Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entry: PerformanceEntry) => {
      this.recordMetric({
        name: 'CLS',
        value: (entry as unknown as { value: number }).value,
        timestamp: Date.now(),
        type: 'vitals',
        metadata: { hadRecentInput: (entry as unknown as { hadRecentInput: boolean }).hadRecentInput },
      });
    });

    // Monitor Time to First Byte (TTFB)
    this.observeNavigation();
  }

  private observeMetric(type: string, callback: (entry: PerformanceEntry) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });
      observer.observe({ type, buffered: true });
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported:`, error);
    }
  }

  private observeNavigation(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Time to First Byte
          this.recordMetric({
            name: 'TTFB',
            value: navEntry.responseStart - navEntry.requestStart,
            timestamp: Date.now(),
            type: 'navigation',
          });

          // DOM Content Loaded
          this.recordMetric({
            name: 'DCL',
            value: navEntry.domContentLoadedEventEnd - (navEntry as unknown as { navigationStart: number }).navigationStart,
            timestamp: Date.now(),
            type: 'navigation',
          });

          // Load Complete
          this.recordMetric({
            name: 'Load',
            value: navEntry.loadEventEnd - (navEntry as unknown as { navigationStart: number }).navigationStart,
            timestamp: Date.now(),
            type: 'navigation',
          });
        }
      });
      observer.observe({ type: 'navigation', buffered: true });
    } catch (error) {
      console.warn('Navigation timing not supported:', error);
    }
  }

  private initializeBundleAnalysis(): void {
    // Monitor resource loading times
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          // Track JavaScript bundle loading times
          if (resource.name.includes('.js') && !resource.name.includes('node_modules')) {
            this.recordMetric({
              name: 'JS Bundle Load',
              value: resource.responseEnd - resource.requestStart,
              timestamp: Date.now(),
              type: 'bundle',
              metadata: {
                url: resource.name,
                size: resource.transferSize,
                cached: resource.transferSize === 0,
              },
            });
          }

          // Track CSS loading times
          if (resource.name.includes('.css')) {
            this.recordMetric({
              name: 'CSS Load',
              value: resource.responseEnd - resource.requestStart,
              timestamp: Date.now(),
              type: 'bundle',
              metadata: {
                url: resource.name,
                size: resource.transferSize,
                cached: resource.transferSize === 0,
              },
            });
          }
        }
      });
      observer.observe({ type: 'resource', buffered: true });
    } catch (error) {
      console.warn('Resource timing not supported:', error);
    }
  }

  public startRenderTimer(componentName: string): () => void {
    if (!this.enabled) return () => {};

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.recordMetric({
        name: `${componentName} Render`,
        value: endTime - startTime,
        timestamp: Date.now(),
        type: 'render',
        metadata: { component: componentName },
      });
    };
  }

  public recordCustomMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;

    this.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'custom',
      metadata,
    });
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`📊 Performance: ${metric.name} = ${metric.value.toFixed(2)}ms`, metric);
    }

    // Report to external services
    this.reportToExternalServices(metric);
  }

  private reportToExternalServices(metric: PerformanceMetric): void {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as unknown as { [key: string]: unknown }).gtag) {
      ((window as unknown as { [key: string]: unknown }).gtag as (command: string, event: string, parameters: unknown) => void)('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_type: metric.type,
        custom_parameter_1: JSON.stringify(metric.metadata),
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric }),
      }).catch(error => {
        console.warn('Failed to send performance metric:', error);
      });
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.type === type);
  }

  public getAverageMetric(name: string): number {
    const matchingMetrics = this.metrics.filter(metric => metric.name === name);
    if (matchingMetrics.length === 0) return 0;
    
    const sum = matchingMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / matchingMetrics.length;
  }

  public generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      totalMetrics: this.metrics.length,
      vitals: {
        lcp: this.getAverageMetric('LCP'),
        fid: this.getAverageMetric('FID'),
        cls: this.getAverageMetric('CLS'),
        ttfb: this.getAverageMetric('TTFB'),
      },
      navigation: {
        dcl: this.getAverageMetric('DCL'),
        load: this.getAverageMetric('Load'),
      },
      bundles: this.getMetricsByType('bundle').length,
      renders: this.getMetricsByType('render').length,
    };

    return JSON.stringify(report, null, 2);
  }

  public exportMetrics(): void {
    if (typeof window === 'undefined') return;

    const report = this.generateReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component render timing
export const useRenderTiming = (componentName: string) => {
  const stopTimer = performanceMonitor.startRenderTimer(componentName);
  
  React.useEffect(() => {
    return stopTimer;
  }, [stopTimer]);
};

// Utility for measuring async operations
export const measureAsync = async <T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordCustomMetric(name, duration, {
      ...metadata,
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordCustomMetric(name, duration, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    
    throw error;
  }
};

export default performanceMonitor;
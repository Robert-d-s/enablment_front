"use client";

import React from "react";
import { performanceMonitor, measureAsync } from "@/app/lib/performanceMonitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PerformanceDemo: React.FC = () => {
  const handleMeasureOperation = async () => {
    // Example: Measure an async operation
    await measureAsync(
      'Demo API Call',
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { data: 'example' };
      },
      { component: 'PerformanceDemo', user: 'demo' }
    );
  };

  const handleShowMetrics = () => {
    // Get current metrics
    const metrics = performanceMonitor.getMetrics();
    console.log('📊 Current Performance Metrics:', metrics);
    
    // Get specific metric averages
    const avgLCP = performanceMonitor.getAverageMetric('LCP');
    const avgFID = performanceMonitor.getAverageMetric('FID');
    
    console.log('📈 Web Vitals:', {
      'Largest Contentful Paint (LCP)': `${avgLCP.toFixed(2)}ms`,
      'First Input Delay (FID)': `${avgFID.toFixed(2)}ms`,
    });
  };

  const handleExportReport = () => {
    // Export performance report
    performanceMonitor.exportMetrics();
  };

  const handleLogCustomMetric = () => {
    // Record custom metric
    performanceMonitor.recordCustomMetric(
      'Custom User Action',
      performance.now(),
      { action: 'button_click', component: 'PerformanceDemo' }
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Performance Monitoring Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button onClick={handleMeasureOperation} className="w-full">
          Measure Async Operation
        </Button>
        <Button onClick={handleShowMetrics} variant="outline" className="w-full">
          Show Metrics in Console
        </Button>
        <Button onClick={handleLogCustomMetric} variant="outline" className="w-full">
          Log Custom Metric
        </Button>
        <Button onClick={handleExportReport} variant="secondary" className="w-full">
          Export Performance Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default PerformanceDemo;
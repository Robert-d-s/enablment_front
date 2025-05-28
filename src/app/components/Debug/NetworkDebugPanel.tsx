"use client";

import React, { useState, useEffect } from "react";
import { networkMonitor } from "@/app/utils/networkMonitor";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NetworkStats {
  totalRequests: number;
  byOperation: Record<string, number>;
  recent: Array<{
    operationName: string;
    type: "query" | "mutation" | "subscription";
    timestamp: number;
    variables?: Record<string, unknown>;
    fetchPolicy?: string;
  }>;
}

const NetworkDebugPanel: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const refreshStats = () => {
    const currentStats = networkMonitor.getRequestStats();
    setStats(currentStats);
  };

  const clearStats = () => {
    networkMonitor.reset();
    setStats(null);
  };

  useEffect(() => {
    if (isVisible && process.env.NODE_ENV === "development") {
      refreshStats();
      // Auto-refresh every 2 seconds
      const interval = setInterval(refreshStats, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          📡 Network Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="bg-white shadow-lg border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-700">
              Network Monitor
            </CardTitle>
            <div className="flex gap-1">
              <Button onClick={refreshStats} variant="ghost" size="sm">
                🔄
              </Button>
              <Button onClick={clearStats} variant="ghost" size="sm">
                🗑️
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
              >
                ❌
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {stats ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium mb-1">
                  Total Requests:{" "}
                  <Badge variant="secondary">{stats.totalRequests}</Badge>
                </p>{" "}
                <p className="text-xs font-medium mb-1">
                  Recent (1min):{" "}
                  <Badge variant="secondary">{stats.recent.length}</Badge>
                </p>
              </div>

              <div className="border-t border-gray-200 my-2" />

              <div>
                <p className="text-xs font-medium mb-2">Operations Count:</p>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {Object.entries(stats.byOperation).map(
                    ([operation, count]) => (
                      <div
                        key={operation}
                        className="flex justify-between text-xs"
                      >
                        <span className="truncate flex-1 mr-2">
                          {operation}
                        </span>
                        <Badge variant="outline" className="text-xs px-1">
                          {count}
                        </Badge>
                      </div>
                    )
                  )}{" "}
                </div>
              </div>

              <div className="border-t border-gray-200 my-2" />

              <div>
                <p className="text-xs font-medium mb-2">Recent Requests:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {stats.recent
                    .slice(-10)
                    .reverse()
                    .map((request, index) => (
                      <div
                        key={index}
                        className="text-xs p-1 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Badge
                            variant={
                              request.type === "mutation"
                                ? "destructive"
                                : request.type === "query"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs px-1"
                          >
                            {request.type.toUpperCase()}
                          </Badge>
                          <span className="font-medium truncate">
                            {request.operationName}
                          </span>
                        </div>
                        {request.variables &&
                          Object.keys(request.variables).length > 0 && (
                            <div className="text-xs text-gray-600 mt-1 font-mono">
                              {JSON.stringify(request.variables, null, 1)
                                .replace(/\n/g, " ")
                                .substring(0, 100)}
                              {JSON.stringify(request.variables).length > 100 &&
                                "..."}
                            </div>
                          )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(request.timestamp).toLocaleTimeString()}
                          {request.fetchPolicy && ` (${request.fetchPolicy})`}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              No network activity recorded
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkDebugPanel;

/**
 * Network monitoring utility for debugging excessive network requests
 */

interface NetworkRequest {
  operationName: string;
  type: "query" | "mutation" | "subscription";
  timestamp: number;
  variables?: Record<string, unknown>;
  fetchPolicy?: string;
}

class NetworkMonitor {
  private requests: NetworkRequest[] = [];
  private isEnabled = process.env.NODE_ENV === "development";

  logRequest(request: NetworkRequest) {
    if (!this.isEnabled) return;

    this.requests.push(request);

    // Log excessive requests for the same operation
    const recentRequests = this.requests.filter(
      (r) =>
        r.operationName === request.operationName &&
        Date.now() - r.timestamp < 5000 // Last 5 seconds
    );

    if (recentRequests.length > 3) {
      console.warn(
        `⚠️ EXCESSIVE NETWORK REQUESTS detected for ${request.operationName}:`,
        `${recentRequests.length} requests in 5 seconds`,
        recentRequests
      );
    }

    console.log(
      `📡 GraphQL ${request.type.toUpperCase()}: ${request.operationName}`,
      request.fetchPolicy ? `(${request.fetchPolicy})` : "",
      request.variables ? request.variables : ""
    );
  }

  getRequestStats() {
    if (!this.isEnabled) return null;

    const stats = this.requests.reduce((acc, req) => {
      acc[req.operationName] = (acc[req.operationName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests: this.requests.length,
      byOperation: stats,
      recent: this.requests.filter((r) => Date.now() - r.timestamp < 60000), // Last minute
    };
  }

  reset() {
    this.requests = [];
  }
}

export const networkMonitor = new NetworkMonitor();

// Simple logging function that can be called manually if needed
export const logGraphQLRequest = (
  operationName: string,
  type: "query" | "mutation" | "subscription",
  variables?: Record<string, unknown>,
  fetchPolicy?: string
) => {
  networkMonitor.logRequest({
    operationName,
    type,
    timestamp: Date.now(),
    variables,
    fetchPolicy,
  });
};

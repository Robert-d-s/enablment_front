import { ApolloClient, DocumentNode } from "@apollo/client";
import { useAuthStore } from "../lib/authStore";

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

// Define the expected structure of the refresh mutation's result
interface RefreshMutationResult {
  refreshToken?: {
    accessToken: string;
  };
  // Add other possible top-level fields from your mutation if they exist
  // e.g., if your mutation is nested under a different key
}

export class TokenRefreshQueue {
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];
  private refreshPromise: Promise<string> | null = null;
  private apolloClient: ApolloClient<object> | null = null;
  private refreshTokenMutation: DocumentNode | null = null;

  constructor() {}

  public initialize(client: ApolloClient<object>, mutation: DocumentNode) {
    this.apolloClient = client;
    this.refreshTokenMutation = mutation;
  }

  async processRequest(): Promise<string> {
    if (!this.apolloClient || !this.refreshTokenMutation) {
      const errorMsg =
        "TokenRefreshQueue not initialized with Apollo Client or mutation.";
      console.error(errorMsg);
      // Immediately reject all queued requests if not initialized
      this.processQueue(new Error(errorMsg), null);
      return Promise.reject(new Error(errorMsg));
    }

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (this.isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefreshInternal();

    try {
      const newToken = await this.refreshPromise;
      this.processQueue(null, newToken);
      return newToken;
    } catch (error) {
      this.processQueue(error as Error, null);
      // Ensure logout is called on final failure from performRefreshInternal
      useAuthStore.getState().logout();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        // window.location.href = "/login"; // Consider if client should also be reset here
      }
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefreshInternal(): Promise<string> {
    if (!this.apolloClient || !this.refreshTokenMutation) {
      // This should ideally be caught by the initialization check in processRequest
      throw new Error(
        "Apollo Client or refresh token mutation not available for token refresh."
      );
    }
    console.log("Attempting token refresh via TokenRefreshQueue...");
    try {
      const { data } = await this.apolloClient.mutate<RefreshMutationResult>({
        mutation: this.refreshTokenMutation,
        // Ensure context is appropriate, e.g., if credentials needed for refresh
        context: { credentials: "include" },
      });

      const newAccessToken = data?.refreshToken?.accessToken;

      if (!newAccessToken) {
        console.error("New access token not received from mutation.");
        throw new Error("New access token not received.");
      }

      console.log("Token refresh successful. New access token obtained.");
      useAuthStore.getState().setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (refreshError) {
      console.error(
        "Token refresh mutation failed within TokenRefreshQueue:",
        refreshError
      );
      // Logout is handled by the caller (processRequest's catch block) to ensure queue processing
      throw refreshError; // Re-throw to be caught by processRequest
    }
  }

  private processQueue(error: Error | null, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      } else {
        // Should not happen if error is null and token is null
        reject(new Error("Unknown error in token refresh queue processing."));
      }
    });
    this.failedQueue = [];
  }

  reset() {
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.failedQueue = [];
    console.log("TokenRefreshQueue has been reset.");
  }
}

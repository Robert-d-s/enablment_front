import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { IssueUpdatePayload } from "@/app/types"; // Assuming IssueUpdatePayload is in types
import { useAuthStore } from "../lib/authStore";

interface UseWebSocketOptions {
  wsUrl: string;
  maxReconnectAttempts?: number;
  onIssueUpdate?: (payload: IssueUpdatePayload) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  socketConnected: boolean;
  connectionStatusMessage: string;
}

const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;

export const useWebSocket = ({
  wsUrl,
  maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
  onIssueUpdate,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0); // State for UI display
  const [connectionStatusMessage, setConnectionStatusMessage] =
    useState("Connecting...");

  // Use a ref for the timeout to ensure it can be cleared correctly across renders/effects
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!wsUrl) {
      setSocketConnected(false);
      setConnectionStatusMessage("WebSocket URL not provided");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Require auth token to connect to authenticated websocket
    if (!accessToken) {
      setSocketConnected(false);
      setConnectionStatusMessage("Not authenticated");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // This function handles a single connection attempt and schedules retries.
    // It uses a passed `attemptCount` for its logic to avoid stale closures on `reconnectAttempts` state for the core retry logic.
    const attemptConnection = (currentAttemptCount: number) => {
      if (socketRef.current && socketRef.current.connected) {
        // console.log("WebSocket already connected during attempt.");
        // This case should ideally be prevented by checks before calling attemptConnection
        // or by the socket.io library itself.
        return;
      }

      // Update UI state for reconnect attempts
      setReconnectAttempts(currentAttemptCount);

      if (currentAttemptCount >= maxReconnectAttempts) {
        setConnectionStatusMessage("Connection failed (Max attempts)");
        console.error("Maximum reconnection attempts reached for", wsUrl);
        socketRef.current = null; // Ensure socketRef is null if connection failed permanently
        return;
      }

      setConnectionStatusMessage(
        `Connecting (Attempt ${currentAttemptCount + 1})...`
      );
      console.log(
        `Attempting WS connection to ${wsUrl} (attempt ${
          currentAttemptCount + 1
        })...`
      );

      // Clear any existing timeout before creating a new socket or new timeout
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }

      // If there's an existing socket, ensure it's cleaned up before creating a new one.
      // This can happen if wsUrl changes and the effect re-runs.
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const newSocket = io(wsUrl, {
        transports: ["websocket"],
        path: "/socket.io",
        reconnection: false, // Manual reconnection handling
        timeout: 10000, // Connection timeout
        withCredentials: true,
        auth: { token: accessToken },
        extraHeaders: { Authorization: `Bearer ${accessToken}` },
      });
      socketRef.current = newSocket; // Assign new socket to ref immediately

      newSocket.on("connect", () => {
        console.log(`WebSocket connected: ${newSocket.id} to ${wsUrl}`);
        setSocketConnected(true);
        setConnectionStatusMessage("Live Updates On");
        setReconnectAttempts(0); // Reset UI attempt counter on successful connection
        if (connectTimeoutRef.current) {
          // Clear any pending connection retry timeouts
          clearTimeout(connectTimeoutRef.current);
          connectTimeoutRef.current = null;
        }
      });

      newSocket.on("connect_error", (error: Error) => {
        console.error(`WebSocket connect_error for ${wsUrl}: ${error.message}`);
        newSocket.disconnect(); // Important: ensure this socket is fully closed
        socketRef.current = null; // Nullify ref as this instance failed
        setSocketConnected(false);
        setConnectionStatusMessage(
          `Connection Error: ${error.message.substring(0, 30)}`
        );

        const nextAttemptCount = currentAttemptCount + 1;
        if (nextAttemptCount < maxReconnectAttempts) {
          connectTimeoutRef.current = setTimeout(() => {
            attemptConnection(nextAttemptCount);
          }, 3000 + Math.random() * 2000);
        } else {
          setConnectionStatusMessage("Connection failed (Max attempts)");
          console.error(
            "Max reconnection attempts reached after connect_error for",
            wsUrl
          );
        }
      });

      newSocket.on("disconnect", (reason: string) => {
        console.log(`WebSocket disconnected from ${wsUrl}: ${reason}`);
        setSocketConnected(false);
        // socketRef.current = null; // Only nullify if this disconnect means the socket is unusable for retries.
        // If attemptConnection creates a new socket each time, this is fine.

        // Only attempt to reconnect if it was not a client-initiated disconnect
        // and we haven't exceeded max attempts.
        // The currentAttemptCount for a spontaneous disconnect needs careful handling.
        // If it disconnects after being connected, attempts should restart or use the main `reconnectAttempts` state.
        if (
          reason !== "io client disconnect" &&
          reason !== "io server disconnect"
        ) {
          // also handle server disconnects if they are not meant for retry
          // For spontaneous disconnects, we use the `reconnectAttempts` state to decide the next attempt count.
          // This is because `currentAttemptCount` from `attemptConnection` is specific to a single connection lifecycle.
          const nextAttemptAfterDisconnect = reconnectAttempts; // Read the current state value
          setConnectionStatusMessage("Disconnected. Retrying...");
          if (nextAttemptAfterDisconnect < maxReconnectAttempts) {
            connectTimeoutRef.current = setTimeout(() => {
              // We call attemptConnection with the *next* logical attempt number based on the current state.
              attemptConnection(nextAttemptAfterDisconnect);
            }, 3000 + Math.random() * 2000);
          } else {
            setConnectionStatusMessage("Disconnected (Max attempts reached)");
            console.error(
              "Max reconnection attempts reached after disconnect for",
              wsUrl
            );
          }
        } else if (reason === "io client disconnect") {
          setConnectionStatusMessage("Disconnected by client");
        } else {
          // e.g. io server disconnect
          setConnectionStatusMessage(`Disconnected by server (${reason})`);
        }
      });

      if (onIssueUpdate) {
        newSocket.on("issueUpdate", onIssueUpdate);
      }
    };

    // Initial connection attempt for this effect lifecycle (e.g. wsUrl or token changed or mount)
    attemptConnection(0);

    return () => {
      console.log(
        "Cleaning up WebSocket connection from useWebSocket hook for",
        wsUrl
      );
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        console.log("Disconnecting socket instance: ", socketRef.current.id);
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketConnected(false); // Ensure connection status is false on cleanup
      // setConnectionStatusMessage("Disconnected"); // Optionally update status message
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, maxReconnectAttempts, onIssueUpdate, accessToken]); // Reconnect when the access token changes

  return {
    socket: socketRef.current, // Expose the current socket instance (can be null)
    socketConnected,
    connectionStatusMessage,
  };
};

// src/app/components/common/ErrorMessage.tsx
import React from "react";
import { ApolloError } from "@apollo/client";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/app/lib/utils";

interface ErrorMessageProps {
  error: ApolloError | Error | null | undefined;
  context?: string;
  className?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  context,
  className,
  onRetry,
}) => {
  if (!error) return null;

  console.error(`Error ${context ? `in ${context}` : ""}:`, error);

  let displayMessage = "An unexpected error occurred.";
  let isForbidden = false;

  if (error instanceof ApolloError) {
    const graphQLError = error.graphQLErrors?.[0];
    isForbidden = graphQLError?.extensions?.code === "FORBIDDEN";
    displayMessage = isForbidden
      ? `Permission denied${context ? ` to access ${context}` : ""}.`
      : graphQLError?.message || error.networkError?.message || error.message;
  } else if (error instanceof Error) {
    displayMessage = error.message;
  }

  return (
    <div
      className={cn(
        "p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md flex flex-col items-center gap-3",
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p className="font-medium">
          Error{context ? ` loading ${context}` : ""}
        </p>
      </div>
      <p className="text-sm text-center">{displayMessage}</p>
      {onRetry && !isForbidden && (
        <Button variant="destructive" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;

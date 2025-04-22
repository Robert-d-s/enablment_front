import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground",
        className
      )}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {message && <p className="text-sm italic">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;

"use client";

import React from "react";
import { AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface AuthErrorProps {
  message?: string;
  className?: string;
}

const AuthError: React.FC<AuthErrorProps> = ({
  message = "You need to be logged in to access this page.",
  className,
}) => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <Card className={`max-w-md mx-auto mt-8 ${className || ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Authentication Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>

        <Button onClick={handleLoginRedirect} className="w-full">
          <LogIn className="h-4 w-4 mr-2" />
          Go to Login
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthError;

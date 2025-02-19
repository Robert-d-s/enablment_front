// src/app/ApolloWrapper.tsx
"use client";

import React, { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client/react";
import client from "@/app/lib/apolloClient";

interface ApolloWrapperProps {
  children: ReactNode;
}

export default function ApolloWrapper({ children }: ApolloWrapperProps) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

// Optimized exports to improve tree-shaking
// This file provides barrel exports that are tree-shakeable for commonly used utilities

// Apollo Client optimized exports
export { 
  useQuery, 
  useMutation, 
  useLazyQuery, 
  useReactiveVar,
  useApolloClient,
  gql,
  ApolloError,
  NetworkStatus,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";

// Zustand optimized exports
export { create } from "zustand";
export { persist, createJSONStorage } from "zustand/middleware";

// Utility library optimized exports
export { clsx } from "clsx";
export { twMerge } from "tailwind-merge";
export { cva } from "class-variance-authority";
// ClassValue is not exported from class-variance-authority

// Date utilities optimized exports
export { 
  format,
  formatISO,
  isToday,
  isSameDay,
  getMonth,
  parseISO,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
} from "date-fns";

// React utilities
export { 
  forwardRef,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
  useReducer,
} from "react";

// Framer Motion optimized exports (most commonly used)
export { 
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

// Lodash alternative - only if using any lodash functions
// Consider removing lodash entirely if possible
// export { debounce, throttle, pick, omit } from "lodash-es";

// Socket.io optimized exports
export { io } from "socket.io-client";
export type { Socket } from "socket.io-client";

// React-toastify optimized exports
export { toast, ToastContainer } from "react-toastify";
export type { ToastOptions } from "react-toastify";

// Use-debounce optimized exports
export { useDebounce, useDebouncedCallback } from "use-debounce";
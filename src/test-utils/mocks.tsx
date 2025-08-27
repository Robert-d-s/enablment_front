import React from "react";

// Enhanced mocking for UI components
export const mockComponents = {
  // Card components
  Card: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div className={className} data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h1 data-testid="card-title">{children}</h1>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),

  // Button component
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),

  // Input component
  Input: ({
    value,
    onChange,
    placeholder,
    disabled,
    ...props
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="input"
      {...props}
    />
  ),

  // Select components
  Select: ({
    children,
    value,
    disabled,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="select" data-value={value} data-disabled={disabled}>
      {children}
    </div>
  ),

  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),

  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),

  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),

  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value" data-placeholder={placeholder} />
  ),
};

// Mock Lucide React icons
export const mockIcons = {
  Timer: ({ className }: { className?: string }) => (
    <div data-testid="timer-icon" className={className} />
  ),
  ChevronLeft: ({ className }: { className?: string }) => (
    <div data-testid="chevron-left" className={className} />
  ),
  ChevronRight: ({ className }: { className?: string }) => (
    <div data-testid="chevron-right" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid="alert-triangle" className={className} />
  ),
  RefreshCw: ({ className }: { className?: string }) => (
    <div data-testid="refresh-cw" className={className} />
  ),
  Play: ({ className }: { className?: string }) => (
    <div data-testid="play-icon" className={className} />
  ),
  Pause: ({ className }: { className?: string }) => (
    <div data-testid="pause-icon" className={className} />
  ),
  Square: ({ className }: { className?: string }) => (
    <div data-testid="square-icon" className={className} />
  ),
  Trash2: ({ className }: { className?: string }) => (
    <div data-testid="trash-icon" className={className} />
  ),
  Plus: ({ className }: { className?: string }) => (
    <div data-testid="plus-icon" className={className} />
  ),
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader-icon" className={className} />
  ),
};

// Mock Zustand store factory
export const createMockStore = <T,>(initialState: T) => {
  let state = initialState;

  const mockStore = {
    getState: () => state,
    setState: (newState: Partial<T>) => {
      state = { ...state, ...newState };
    },
    subscribe: jest.fn(),
    destroy: jest.fn(),
  };

  return mockStore;
};

// Mock Apollo Client queries and mutations
export const createMockApolloResponse = (
  data: unknown,
  loading = false,
  error = null
) => ({
  loading,
  error,
  data,
  refetch: jest.fn(),
  fetchMore: jest.fn(),
  networkStatus: 7,
  called: !loading,
});

// Mock timer calculations
export const mockTimerCalculations = {
  formatSecondsToHHMMSS: (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = seconds.toString().padStart(2, "0");

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  },
};

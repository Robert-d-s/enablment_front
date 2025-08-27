import "@testing-library/jest-dom";

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  reload: jest.fn(),
  pathname: "/",
  route: "/",
  query: {},
  asPath: "/",
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: "div",
    span: "span",
    button: "button",
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => {
  // Using dynamic import since this is inside a mock function
  return jest.requireActual("./src/test-utils/mocks").mockIcons;
});

// Mock UI components
jest.mock("@/components/ui/card", () => {
  const { mockComponents } = jest.requireActual("./src/test-utils/mocks");
  return {
    Card: mockComponents.Card,
    CardHeader: mockComponents.CardHeader,
    CardTitle: mockComponents.CardTitle,
    CardContent: mockComponents.CardContent,
  };
});

jest.mock("@/components/ui/button", () => {
  const { mockComponents } = jest.requireActual("./src/test-utils/mocks");
  return {
    Button: mockComponents.Button,
    buttonVariants: () => "mock-button-class",
  };
});

jest.mock("@/components/ui/input", () => {
  const { mockComponents } = jest.requireActual("./src/test-utils/mocks");
  return {
    Input: mockComponents.Input,
  };
});

jest.mock("@/components/ui/select", () => {
  const { mockComponents } = jest.requireActual("./src/test-utils/mocks");
  return {
    Select: mockComponents.Select,
    SelectContent: mockComponents.SelectContent,
    SelectItem: mockComponents.SelectItem,
    SelectTrigger: mockComponents.SelectTrigger,
    SelectValue: mockComponents.SelectValue,
  };
});

// Mock socket.io-client
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock react-datepicker
jest.mock("react-datepicker", () => {
  const MockDatePicker = ({ onChange, selected, ...props }) => {
    return (
      <input
        data-testid="date-picker"
        type="date"
        value={selected?.toISOString().split("T")[0] || ""}
        onChange={(e) => onChange(new Date(e.target.value))}
        {...props}
      />
    );
  };
  MockDatePicker.displayName = "MockDatePicker";
  return MockDatePicker;
});

// Suppress console.log in tests unless debugging
const originalConsole = console;
beforeEach(() => {
  if (!process.env.DEBUG_TESTS) {
    console.log = jest.fn();
    console.warn = jest.fn();
  }
});

afterEach(() => {
  if (!process.env.DEBUG_TESTS) {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

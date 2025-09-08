import type { NextConfig } from "next";
import createNextBundleAnalyzer from "@next/bundle-analyzer"; // Corrected import

// Initialize the bundle analyzer plugin
// createNextBundleAnalyzer is a function that takes options and returns the HOC
const withBundleAnalyzer = createNextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true, // Automatically open the report in the browser after build
  // You can choose the mode: 'server', 'static', or 'disabled'
  // analyzerMode: 'static', // Example: Generates a static HTML file
  // If using 'static' mode, you might want to specify the report path:
  // reportFilename: './analyze/client-bundle-report.html',
});

const nextConfig: NextConfig = {
  // Enable performance optimizations
  poweredByHeader: false,
  compress: true,
  output: "standalone", // Enable for Docker containerization

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "public.linear.app",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },

  // Enable experimental features for better optimization
  experimental: {
    optimizePackageImports: [
      // UI component libraries
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",

      // Date utilities
      "date-fns",
      "react-datepicker",
      "react-day-picker",

      // State management and utilities
      "zustand",
      "use-debounce",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",

      // Toast notifications
      "react-toastify",

      // GraphQL utilities
      "graphql-tag",
    ],
  },

  // Enhanced webpack configuration for granular bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production
    if (!dev && !isServer) {
      // Enable better tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // More granular chunk splitting for better caching and lazy loading
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 250000,
        cacheGroups: {
          // Core React libraries - loaded on every page
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "react-vendor",
            priority: 50,
            chunks: "all",
            enforce: true,
          },

          // Apollo Client - primarily used in admin and data-heavy pages
          apollo: {
            test: /[\\/]node_modules[\\/](@apollo|graphql)[\\/]/,
            name: "apollo-vendor",
            priority: 40,
            chunks: "all",
          },

          // Framer Motion - heavily used in landing page, moderately in admin
          framerMotion: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: "framer-motion-vendor",
            priority: 35,
            chunks: "all",
          },

          // Radix UI components - primarily admin and UI components
          radixUI: {
            test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
            name: "radix-ui-vendor",
            priority: 30,
            chunks: "all",
          },

          // Date utilities - used in various components but not critical path
          dateUtils: {
            test: /[\\/]node_modules[\\/](date-fns|react-datepicker|react-day-picker)[\\/]/,
            name: "date-vendor",
            priority: 25,
            chunks: "all",
          },

          // Socket.io - real-time features, not critical for initial load
          socketIO: {
            test: /[\\/]node_modules[\\/](socket\.io-client)[\\/]/,
            name: "socket-vendor",
            priority: 20,
            chunks: "all",
          },

          // UI utilities and smaller libraries
          uiUtils: {
            test: /[\\/]node_modules[\\/](lucide-react|class-variance-authority|clsx|tailwind-merge|react-toastify)[\\/]/,
            name: "ui-utils-vendor",
            priority: 15,
            chunks: "all",
          },

          // State management and hooks
          stateManagement: {
            test: /[\\/]node_modules[\\/](zustand|use-debounce)[\\/]/,
            name: "state-vendor",
            priority: 10,
            chunks: "all",
          },

          // Common vendor libraries for everything else
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 5,
            chunks: "all",
            minChunks: 2,
          },

          // Default chunk for application code
          default: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
            name: "app-common",
          },
        },
      };

      // Add module concatenation for better performance
      config.optimization.concatenateModules = true;

      // Configure module IDs for better caching
      config.optimization.moduleIds = "deterministic";
      config.optimization.chunkIds = "deterministic";
    }

    return config;
  },
};

// Wrap the Next.js config with the bundle analyzer HOC
export default withBundleAnalyzer(nextConfig);

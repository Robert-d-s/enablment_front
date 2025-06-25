import type { NextConfig } from "next";
import createNextBundleAnalyzer from '@next/bundle-analyzer'; // Corrected import

// Initialize the bundle analyzer plugin
// createNextBundleAnalyzer is a function that takes options and returns the HOC
const withBundleAnalyzer = createNextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true, // Automatically open the report in the browser after build
  // You can choose the mode: 'server', 'static', or 'disabled'
  // analyzerMode: 'static', // Example: Generates a static HTML file
  // If using 'static' mode, you might want to specify the report path:
  // reportFilename: './analyze/client-bundle-report.html',
});

const nextConfig: NextConfig = {
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
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
    ],
  },

  // Simplified webpack configuration for actual size reduction
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production
    if (!dev && !isServer) {
      // Enable better tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Minimize the number of chunks to reduce overhead
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Large vendor libraries that change infrequently
          vendors: {
            test: /[\\/]node_modules[\\/](@apollo|framer-motion|@radix-ui)[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          // Everything else
          default: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
};

// Wrap the Next.js config with the bundle analyzer HOC
export default withBundleAnalyzer(nextConfig);

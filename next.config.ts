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
};

// Wrap the Next.js config with the bundle analyzer HOC
export default withBundleAnalyzer(nextConfig);

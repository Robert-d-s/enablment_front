# Monitoring Usage Guide

## Daily Development Workflow

### 1. **Bundle Size Monitoring**
```bash
# Before adding new dependencies
npm run analyze:clean

# Add your new dependency
npm install some-library

# Check impact
npm run analyze:clean
# Compare .next/analyze/client.html before/after
```

### 2. **Error Monitoring**
```bash
# Enable in development
echo "NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true" >> .env.local

# Start development server
npm run dev

# Errors are automatically logged to console with context
# Check browser DevTools → Console for error reports
```

### 3. **Performance Monitoring**
```bash
# Enable performance tracking
echo "NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true" >> .env.local

# Start development
npm run dev

# Check console for Web Vitals and performance metrics
# Use the PerformanceDemo component to interact with monitoring
```

## Production Usage

### 1. **Error Tracking Setup**
```bash
# Production environment variables
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT=https://api.sentry.io/projects/your-project
NEXT_PUBLIC_ERROR_REPORTING_API_KEY=your-sentry-dsn

# Or use any error tracking service:
# - Sentry
# - LogRocket  
# - Bugsnag
# - Custom endpoint
```

### 2. **Performance Analytics**
```bash
# Add Google Analytics or custom analytics
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics.com/api

# Performance metrics will be sent automatically
```

### 3. **CI/CD Integration**
```bash
# In your CI pipeline
npm run build:ci          # Quality check + build
npm run build:analyze     # Quality check + bundle analysis

# Bundle analysis reports can be stored as CI artifacts
# Set up alerts for bundle size increases
```

## Monitoring Dashboard Examples

### Browser Console Monitoring
When enabled, you'll see:
```
📊 Performance: LCP = 1250.45ms
📊 Performance: FID = 12.30ms  
🚨 Error Report [feature]: Admin feature User Management error
📈 Bundle Load: vendors.js = 245ms
```

### Custom Metrics
```typescript
// In your components
import { performanceMonitor } from "@/app/lib/performanceMonitor";

// Measure component render time
useEffect(() => {
  const stopTimer = performanceMonitor.startRenderTimer('MyComponent');
  return stopTimer; // Automatically measures on unmount
}, []);

// Measure API calls
const fetchData = async () => {
  await measureAsync('User Data Fetch', async () => {
    return api.getUsers();
  });
};
```

### Error Boundary Testing
To test error boundaries:
```typescript
// Temporarily add this to any component to trigger error boundary
if (Math.random() > 0.5) {
  throw new Error('Test error boundary');
}
```

## Bundle Analysis Interpretation

Open `.next/analyze/client.html` and look for:
- **Large dependencies** (>50KB) that could be optimized
- **Duplicate modules** across chunks
- **Unused code** that could be tree-shaken
- **Opportunity for code splitting** on large components

## Integration with External Services

### Sentry Integration
```typescript
// Automatically integrates if window.Sentry is available
// Add Sentry script to your layout.tsx:
// <script src="https://browser.sentry-cdn.com/..."></script>
```

### Google Analytics Integration  
```typescript
// Automatically sends performance events if window.gtag is available
// Add GA script to your layout.tsx
```

### Custom Analytics
```typescript
// Set NEXT_PUBLIC_ANALYTICS_ENDPOINT in your environment
// All metrics will be POSTed to this endpoint
```

## Monitoring Best Practices

1. **Enable error reporting in production only**
2. **Use bundle analysis before every major release**
3. **Monitor Web Vitals for user experience**
4. **Set up alerts for bundle size increases**
5. **Regular performance report exports for analysis**
6. **Test error boundaries in development**
7. **Use custom metrics for business-critical operations**

## Troubleshooting

### GraphQL 404 Errors (`POST /undefined/graphql 404`)
This means `NEXT_PUBLIC_BACKEND_URL` is not set:
```bash
# Fix: Create .env.local with your backend URL
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:4000" > .env.local

# Restart your dev server
npm run dev
```

### General Monitoring Issues
If monitoring isn't working:
1. **Check environment variables are set correctly**
   ```bash
   cat .env.local  # Should show NEXT_PUBLIC_BACKEND_URL
   ```
2. **Verify browser DevTools → Console for error messages**
3. **Ensure error boundaries are properly wrapped around components**
4. **Check `.env.local` file exists and is loaded**
5. **Performance monitoring requires modern browsers with Performance API**
6. **Backend server must be running on the specified URL**
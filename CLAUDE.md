# Claude Development Guide

This file contains project-specific information for Claude to provide better assistance.

## Project Overview
- **Name**: Enablment Front-end
- **Type**: Next.js 15 React application with TypeScript
- **Primary Features**: Admin dashboard, time tracking, issues management, user management

## Development Commands
```bash
# Development
npm run dev

# Production build  
npm run build
npm start

# Code quality
npm run lint

# Bundle analysis
ANALYZE=true npm run build
```

## Architecture

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **GraphQL**: Apollo Client
- **Database**: GraphQL backend
- **Real-time**: Socket.io
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Project Structure
```
src/
├── app/                          # Next.js App Router
│   ├── components/              # Reusable components
│   │   ├── Admin/              # Admin-specific components
│   │   ├── ErrorBoundaries/    # Error handling components
│   │   ├── Issues/             # Issue management
│   │   ├── timer/              # Time tracking
│   │   └── landingPage/        # Landing page sections
│   ├── graphql/                # GraphQL operations & fragments
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and configuration
│   └── [pages]/                # Route pages
└── components/ui/              # shadcn/ui components
```

### GraphQL Architecture
- **Fragments**: Centralized in `src/app/graphql/fragments.ts`
- **Operations**: Organized by domain (admin, auth, timeKeeper)
- **Caching**: Apollo Client with optimized cache policies

### Error Handling
- **Hierarchy**: Page → Feature → Component level error boundaries
- **Reporting**: Centralized error reporting service
- **Recovery**: Graceful degradation with retry mechanisms

## Performance Optimizations

### Bundle Optimization
- GraphQL fragments reduce query duplication
- Webpack tree-shaking enabled
- Next.js optimizePackageImports for major libraries
- Font optimization with display: swap

### Code Quality
- **Linting**: ESLint with Next.js config
- **Type Safety**: Strict TypeScript configuration  
- **Error Boundaries**: Comprehensive error handling
- **Performance**: Bundle analysis and monitoring tools

## Development Guidelines

### Component Patterns
- Use error boundaries for features that can fail independently
- Implement proper loading and error states
- Follow consistent naming: PascalCase for components
- Co-locate related components and logic

### GraphQL Best Practices
- Use fragments for reusable field selections
- Implement proper error handling with try-catch
- Cache policies: cache-and-network for real-time data
- Consistent `__typename` for Apollo cache normalization

### State Management
- **Global**: Zustand for auth and timer state
- **Local**: React hooks for component-specific state
- **Server**: Apollo Client cache for GraphQL data
- **Persistence**: Zustand persist middleware for important state

### Error Handling Strategy
- **Page Level**: Full page protection with navigation fallback
- **Feature Level**: Isolated feature protection with retry options
- **Component Level**: Minimal disruption with inline error messages
- **Network Level**: Retry mechanisms and connection state handling

## Common Tasks

### Adding New Features
1. Create components in appropriate domain folder
2. Add GraphQL operations and fragments
3. Implement error boundaries where appropriate
4. Add proper TypeScript types
5. Test error scenarios and edge cases

### Performance Investigation
```bash
# Generate bundle analysis
ANALYZE=true npm run build

# Check bundle reports in .next/analyze/
# Focus on client.html for main bundle analysis
```

### Debugging
- Error boundaries capture and report component errors
- Network tab for GraphQL operation debugging  
- Apollo DevTools for cache inspection
- Console logs include error context and session info

## Environment Variables

### Required Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000  # Update to your backend
```

### Common Backend URLs
- **Development**: `http://localhost:4000`
- **Staging**: `https://api-staging.yourdomain.com`
- **Production**: `https://api.yourdomain.com`

See `.env.example` for all available configuration options.

## Production Considerations
- Error reporting integration configured but disabled by default
- Bundle analysis available via ANALYZE=true environment variable
- Performance monitoring available for development
- All sensitive data should use environment variables

## Recent Optimizations (Phase 1 & 2)
- ✅ Security vulnerabilities fixed (Next.js updated)
- ✅ GraphQL fragments system implemented (~200 lines of duplication removed)
- ✅ Error boundary hierarchy established
- ✅ Bundle splitting and tree-shaking configured
- ✅ Performance monitoring infrastructure added

## Notes for Claude
- Always run lint and type checks after making changes
- Use fragments for any new GraphQL operations
- Wrap new features with appropriate error boundaries
- Check bundle impact with ANALYZE=true when adding dependencies
- Prefer editing existing files over creating new ones
- Follow existing patterns and conventions in the codebase
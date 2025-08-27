import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import LoadingError from '../LoadingError'

describe('LoadingError', () => {
  const mockError = new Error('Test error message')
  const mockOnRetry = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock NODE_ENV for development mode tests
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
    })
  })

  describe('Loading State', () => {
    it('should render loading state correctly', () => {
      render(<LoadingError error={null} isLoading={true} />)
      
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
      expect(screen.getByText('Loading data...')).toBeInTheDocument()
    })

    it('should render loading state with custom context', () => {
      render(<LoadingError error={null} isLoading={true} context="users" />)
      
      expect(screen.getByText('Loading users...')).toBeInTheDocument()
    })

    it('should apply custom className in loading state', () => {
      render(<LoadingError error={null} isLoading={true} className="custom-loading" />)
      
      const cardElement = screen.getByTestId('card')
      expect(cardElement).toHaveClass('custom-loading')
    })
  })

  describe('Error State', () => {
    it('should render error state correctly', () => {
      render(<LoadingError error={mockError} />)
      
      expect(screen.getByTestId('alert-triangle')).toBeInTheDocument()
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should render error with custom context', () => {
      render(<LoadingError error={mockError} context="users" />)
      
      expect(screen.getByText('Error Loading users')).toBeInTheDocument()
    })

    it('should render default error message when error.message is empty', () => {
      const errorWithoutMessage = new Error('')
      render(<LoadingError error={errorWithoutMessage} />)
      
      expect(screen.getByText('An unexpected error occurred while loading data.')).toBeInTheDocument()
    })

    it('should render retry button when onRetry is provided', async () => {
      const user = userEvent.setup()
      render(<LoadingError error={mockError} onRetry={mockOnRetry} />)
      
      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()
      expect(screen.getByTestId('refresh-cw')).toBeInTheDocument()
      
      await user.click(retryButton)
      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should not render retry button when onRetry is not provided', () => {
      render(<LoadingError error={mockError} />)
      
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
    })

    it('should apply custom className in error state', () => {
      render(<LoadingError error={mockError} className="custom-error" />)
      
      const cardElement = screen.getByTestId('card')
      expect(cardElement).toHaveClass('custom-error')
    })
  })

  describe('Development Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should show error details in development mode', () => {
      const errorWithStack = new Error('Test error')
      errorWithStack.stack = 'Error: Test error\n    at TestComponent'
      
      render(<LoadingError error={errorWithStack} />)
      
      expect(screen.getByText('Error Details')).toBeInTheDocument()
      
      // The details should contain the stack trace
      const details = screen.getByRole('group') // details element has group role
      expect(details).toHaveTextContent('Error: Test error')
      expect(details).toHaveTextContent('at TestComponent')
    })

    it('should fallback to toString when no stack is available', () => {
      const errorWithoutStack = new Error('Test error')
      errorWithoutStack.stack = undefined
      
      render(<LoadingError error={errorWithoutStack} />)
      
      const details = screen.getByRole('group')
      expect(details).toHaveTextContent('Error: Test error')
    })

    afterEach(() => {
      process.env.NODE_ENV = 'test'
    })
  })

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('should not show error details in production mode', () => {
      const errorWithStack = new Error('Test error')
      errorWithStack.stack = 'Error: Test error\n    at TestComponent'
      
      render(<LoadingError error={errorWithStack} />)
      
      expect(screen.queryByText('Error Details')).not.toBeInTheDocument()
    })

    afterEach(() => {
      process.env.NODE_ENV = 'test'
    })
  })

  describe('Null States', () => {
    it('should return null when no error and not loading', () => {
      const { container } = render(<LoadingError error={null} isLoading={false} />)
      
      expect(container.firstChild).toBeNull()
    })

    it('should return null when error is null and isLoading is false (default)', () => {
      const { container } = render(<LoadingError error={null} />)
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading in error state', () => {
      render(<LoadingError error={mockError} />)
      
      const title = screen.getByText('Error Loading Data')
      expect(title.tagName).toBe('H1') // CardTitle renders as h1 in our mock
    })

    it('should have accessible retry button', () => {
      render(<LoadingError error={mockError} onRetry={mockOnRetry} />)
      
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button).toBeEnabled()
    })

    it('should have proper loading indicator', () => {
      render(<LoadingError error={null} isLoading={true} />)
      
      const loader = screen.getByTestId('loader-icon')
      expect(loader).toBeInTheDocument()
    })
  })
})
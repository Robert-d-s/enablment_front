import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import AuthError from '../AuthError'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('AuthError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with default message', () => {
    render(<AuthError />)
    
    expect(screen.getByText('Authentication Required')).toBeInTheDocument()
    expect(screen.getByText('You need to be logged in to access this page.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    const customMessage = 'Please log in to continue'
    render(<AuthError message={customMessage} />)
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
    expect(screen.queryByText('You need to be logged in to access this page.')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const customClass = 'custom-auth-error'
    render(<AuthError className={customClass} />)
    
    const cardElement = screen.getByRole('button', { name: /go to login/i }).closest('.max-w-md')
    expect(cardElement).toHaveClass(customClass)
  })

  it('should render alert triangle icon', () => {
    render(<AuthError />)
    
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument()
  })

  it('should render login icon in button', () => {
    render(<AuthError />)
    
    const button = screen.getByRole('button', { name: /go to login/i })
    expect(button).toBeInTheDocument()
    // The LogIn icon should be rendered within the button
    expect(button.querySelector('[data-testid="login-icon"]')).toBeInTheDocument()
  })

  it('should navigate to login when button is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthError />)
    
    const loginButton = screen.getByRole('button', { name: /go to login/i })
    await user.click(loginButton)
    
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should have proper accessibility attributes', () => {
    render(<AuthError />)
    
    const button = screen.getByRole('button', { name: /go to login/i })
    expect(button).toBeEnabled()
    
    // Check that the card title has proper heading semantics
    const title = screen.getByText('Authentication Required')
    expect(title.tagName).toBe('H1') // CardTitle renders as h1 in our mock
  })

  it('should handle missing className gracefully', () => {
    render(<AuthError />)
    
    const cardElement = screen.getByRole('button', { name: /go to login/i }).closest('.max-w-md')
    expect(cardElement).toBeInTheDocument()
    expect(cardElement).toHaveClass('max-w-md', 'mx-auto', 'mt-8')
  })

  it('should display all required UI elements', () => {
    render(<AuthError />)
    
    // Card components
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
    
    // Button
    expect(screen.getByTestId('button')).toBeInTheDocument()
    
    // Icons
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument()
  })
})
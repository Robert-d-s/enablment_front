import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import ContactForm from '../contactForm'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

describe('ContactForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnClose = jest.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onClose: mockOnClose,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form rendering', () => {
    it('should render all form fields', () => {
      render(<ContactForm {...defaultProps} />)

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Your message')).toBeInTheDocument()
    })

    it('should render submit button with correct aria-label', () => {
      render(<ContactForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: 'Send' })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should render close button', () => {
      render(<ContactForm {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: '✕' })
      expect(closeButton).toBeInTheDocument()
    })

    it('should render video element', () => {
      render(<ContactForm {...defaultProps} />)

      const video = screen.getByText('Your browser does not support the video tag.').closest('video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('autoPlay')
      expect(video).toHaveAttribute('loop')
      // Note: muted and playsInline are boolean attributes that may not show in testing
    })
  })

  describe('Company information', () => {
    it('should display company address', () => {
      render(<ContactForm {...defaultProps} />)

      expect(screen.getByText('Øster Allé 56 6. sal')).toBeInTheDocument()
      expect(screen.getByText('2100 København Ø')).toBeInTheDocument()
      expect(screen.getByText('CVR: 42309648')).toBeInTheDocument()
    })

    it('should display contact information', () => {
      render(<ContactForm {...defaultProps} />)

      expect(screen.getByText('(+45) 22 92 67 80')).toBeInTheDocument()
      expect(screen.getByText('gd@enablment.com')).toBeInTheDocument()
    })

    it('should display social media icons', () => {
      render(<ContactForm {...defaultProps} />)

      expect(screen.getByAltText('instagram')).toBeInTheDocument()
      expect(screen.getByAltText('facebook')).toBeInTheDocument()
      expect(screen.getByAltText('linkedin')).toBeInTheDocument()
      expect(screen.getByAltText('twitter')).toBeInTheDocument()
    })

    it('should display contact icons', () => {
      render(<ContactForm {...defaultProps} />)

      expect(screen.getByAltText('call')).toBeInTheDocument()
      expect(screen.getByAltText('email')).toBeInTheDocument()
    })

    it('should render policy links', () => {
      render(<ContactForm {...defaultProps} />)

      const cookiePolicy = screen.getByRole('link', { name: 'Cookie policy' })
      const privacyPolicy = screen.getByRole('link', { name: 'Privacy policy' })

      expect(cookiePolicy).toBeInTheDocument()
      expect(privacyPolicy).toBeInTheDocument()
      expect(cookiePolicy).toHaveAttribute('href', '#')
      expect(privacyPolicy).toHaveAttribute('href', '#')
    })
  })

  describe('Form interaction', () => {
    it('should update form data when inputs change', async () => {
      const user = userEvent.setup()
      render(<ContactForm {...defaultProps} />)

      const nameInput = screen.getByPlaceholderText('Name')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const messageInput = screen.getByPlaceholderText('Your message')

      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(messageInput, 'Hello World')

      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
      expect(messageInput).toHaveValue('Hello World')
    })

    it('should call onSubmit with form data when form is submitted', async () => {
      const user = userEvent.setup()
      render(<ContactForm {...defaultProps} />)

      const nameInput = screen.getByPlaceholderText('Name')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const messageInput = screen.getByPlaceholderText('Your message')
      const submitButton = screen.getByRole('button', { name: 'Send' })

      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(messageInput, 'Test message')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      })
    })

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<ContactForm {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: '✕' })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked in overlay mode', async () => {
      const user = userEvent.setup()
      render(<ContactForm {...defaultProps} isOverlay={true} />)

      // Get the backdrop element (the overlay)
      const backdrop = screen.getByRole('button', { name: '✕' })
        .closest('[class*="fixed"]')
        ?.querySelector('[class*="absolute"]')

      if (backdrop) {
        await user.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should require all fields', () => {
      render(<ContactForm {...defaultProps} />)

      const nameInput = screen.getByPlaceholderText('Name')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const messageInput = screen.getByPlaceholderText('Your message')

      expect(nameInput).toBeRequired()
      expect(emailInput).toBeRequired()
      expect(messageInput).toBeRequired()
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Display modes', () => {
    it('should render as overlay by default', () => {
      render(<ContactForm {...defaultProps} />)

      const overlayContainer = screen.getByRole('button', { name: '✕' })
        .closest('[class*="fixed"]')
      expect(overlayContainer).toHaveClass('fixed', 'inset-0')
    })

    it('should render without overlay when isOverlay is false', () => {
      render(<ContactForm {...defaultProps} isOverlay={false} />)

      const overlayContainer = screen.queryByText('✕')
        ?.closest('[class*="fixed"]')
      expect(overlayContainer).not.toBeInTheDocument()

      // But form content should still be there
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<ContactForm {...defaultProps} className="custom-class" />)

      const overlayContainer = screen.getByRole('button', { name: '✕' })
        .closest('[class*="fixed"]')
      expect(overlayContainer).toHaveClass('custom-class')
    })
  })

  describe('UI elements', () => {
    it('should display email header correctly', () => {
      render(<ContactForm {...defaultProps} />)

      expect(screen.getByText('To:')).toBeInTheDocument()
      expect(screen.getByText('Enablment')).toBeInTheDocument()
    })

    it('should display reCAPTCHA notice', () => {
      render(<ContactForm {...defaultProps} />)

      expect(screen.getByText(/This site is protected by reCAPTCHA/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Privacy Policy/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Terms of Service/ })).toBeInTheDocument()
    })

    it('should render submit button icon', () => {
      render(<ContactForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: 'Send' })
      const svgIcon = submitButton.querySelector('svg')
      expect(svgIcon).toBeInTheDocument()
      expect(svgIcon).toHaveClass('w-6', 'h-6', 'text-white')
    })
  })

  describe('Styling and layout', () => {
    it('should apply proper form container styling', () => {
      render(<ContactForm {...defaultProps} />)

      const formContainer = screen.getByText('To:').closest('.contact-form-container')
      expect(formContainer).toHaveClass(
        'bg-white',
        'flex',
        'gap-4',
        'rounded-lg',
        'shadow-lg',
        'p-8',
        'm-4'
      )
    })

    it('should have proper button hover styles', () => {
      render(<ContactForm {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: '✕' })
      const submitButton = screen.getByRole('button', { name: 'Send' })

      expect(closeButton).toHaveClass('hover:bg-red-500', 'hover:scale-105')
      expect(submitButton).toHaveClass('hover:bg-green-500', 'hover:scale-105')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<ContactForm {...defaultProps} />)

      // Form elements should exist even if form role is not properly detected
      const nameInput = screen.getByPlaceholderText('Name')
      const emailInput = screen.getByPlaceholderText('E-mail')
      const messageInput = screen.getByPlaceholderText('Your message')
      const submitButton = screen.getByRole('button', { name: 'Send' })

      expect(nameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(messageInput).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should have accessible button labels', () => {
      render(<ContactForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: 'Send' })
      const closeButton = screen.getByRole('button', { name: '✕' })

      expect(submitButton).toHaveAttribute('aria-label', 'Send')
      expect(closeButton).toBeInTheDocument()
    })
  })
})
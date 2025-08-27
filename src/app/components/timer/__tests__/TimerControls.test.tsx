import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import TimerControls from '../TimerControls'

describe('TimerControls', () => {
  const mockHandleStartStop = jest.fn()
  const mockHandleReset = jest.fn()
  const mockHandleSubmit = jest.fn()

  const defaultProps = {
    isRunning: false,
    handleStartStop: mockHandleStartStop,
    handleReset: mockHandleReset,
    handleSubmit: mockHandleSubmit,
    disabledStartPause: false,
    disabledReset: false,
    disabledSubmit: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial render', () => {
    it('should render all control buttons', () => {
      render(<TimerControls {...defaultProps} />)

      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('should render form element', () => {
      render(<TimerControls {...defaultProps} />)

      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Start/Stop button behavior', () => {
    it('should show Start button when timer is not running', () => {
      render(<TimerControls {...defaultProps} isRunning={false} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      expect(startButton).toBeInTheDocument()
      expect(screen.getByTestId('play-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('pause-icon')).not.toBeInTheDocument()
    })

    it('should show Pause button when timer is running', () => {
      render(<TimerControls {...defaultProps} isRunning={true} />)

      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).toBeInTheDocument()
      expect(screen.getByTestId('pause-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('play-icon')).not.toBeInTheDocument()
    })

    it('should call handleStartStop when Start button is clicked', async () => {
      const user = userEvent.setup()
      render(<TimerControls {...defaultProps} isRunning={false} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      await user.click(startButton)

      expect(mockHandleStartStop).toHaveBeenCalledTimes(1)
    })

    it('should call handleStartStop when Pause button is clicked', async () => {
      const user = userEvent.setup()
      render(<TimerControls {...defaultProps} isRunning={true} />)

      const pauseButton = screen.getByRole('button', { name: /pause/i })
      await user.click(pauseButton)

      expect(mockHandleStartStop).toHaveBeenCalledTimes(1)
    })

    it('should disable Start/Pause button when disabledStartPause is true', () => {
      render(<TimerControls {...defaultProps} disabledStartPause={true} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      expect(startButton).toBeDisabled()
    })
  })

  describe('Reset button behavior', () => {
    it('should render Reset button with correct icon', () => {
      render(<TimerControls {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeInTheDocument()
      expect(screen.getByTestId('rotate-ccw')).toBeInTheDocument()
    })

    it('should call handleReset when Reset button is clicked', async () => {
      const user = userEvent.setup()
      render(<TimerControls {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      await user.click(resetButton)

      expect(mockHandleReset).toHaveBeenCalledTimes(1)
    })

    it('should disable Reset button when disabledReset is true', () => {
      render(<TimerControls {...defaultProps} disabledReset={true} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeDisabled()
    })
  })

  describe('Submit button behavior', () => {
    it('should render Submit button with correct icon', () => {
      render(<TimerControls {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      expect(submitButton).toBeInTheDocument()
      expect(screen.getByTestId('send')).toBeInTheDocument()
    })

    it('should call handleSubmit when Submit button is clicked', async () => {
      const user = userEvent.setup()
      render(<TimerControls {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should call handleSubmit when form is submitted', async () => {
      const user = userEvent.setup()
      render(<TimerControls {...defaultProps} />)

      const form = screen.getByRole('form')
      await user.type(form, '{enter}')

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should disable Submit button when disabledSubmit is true', () => {
      render(<TimerControls {...defaultProps} disabledSubmit={true} />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Button styling', () => {
    it('should apply green styling when timer is not running', () => {
      render(<TimerControls {...defaultProps} isRunning={false} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      expect(startButton).toHaveClass('bg-green-600', 'hover:bg-green-700')
    })

    it('should apply red styling when timer is running', () => {
      render(<TimerControls {...defaultProps} isRunning={true} />)

      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).toHaveClass('bg-red-600', 'hover:bg-red-700')
    })

    it('should apply outline variant to Reset button', () => {
      render(<TimerControls {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toHaveAttribute('data-variant', 'outline')
    })
  })

  describe('Accessibility', () => {
    it('should have proper button types', () => {
      render(<TimerControls {...defaultProps} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      const resetButton = screen.getByRole('button', { name: /reset/i })
      const submitButton = screen.getByRole('button', { name: /submit/i })

      expect(startButton).toHaveAttribute('type', 'button')
      expect(resetButton).toHaveAttribute('type', 'button')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should have proper ARIA labels for all buttons', () => {
      render(<TimerControls {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle all disabled states correctly', () => {
      render(
        <TimerControls
          {...defaultProps}
          disabledStartPause={true}
          disabledReset={true}
          disabledSubmit={true}
        />
      )

      const startButton = screen.getByRole('button', { name: /start/i })
      const resetButton = screen.getByRole('button', { name: /reset/i })
      const submitButton = screen.getByRole('button', { name: /submit/i })

      expect(startButton).toBeDisabled()
      expect(resetButton).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })

    it('should handle form submission with preventDefault', async () => {
      const user = userEvent.setup()
      const mockSubmitEvent = jest.fn((e) => e.preventDefault())
      
      render(<TimerControls {...defaultProps} handleSubmit={mockSubmitEvent} />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(mockSubmitEvent).toHaveBeenCalledTimes(1)
      expect(mockSubmitEvent.mock.calls[0][0]).toBeInstanceOf(Event)
    })

    it('should display all required icons', () => {
      render(<TimerControls {...defaultProps} isRunning={false} />)

      // Start state icons
      expect(screen.getByTestId('play-icon')).toBeInTheDocument()
      expect(screen.getByTestId('rotate-ccw')).toBeInTheDocument()
      expect(screen.getByTestId('send')).toBeInTheDocument()
    })
  })
})
import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import TimerDisplay from '../TimerDisplay'

// Mock dynamic import and react-datepicker
jest.mock('next/dynamic', () => {
  return function mockDynamic() {
    const MockComponent = ({ 
      selected, 
      onChange, 
      disabled, 
      renderCustomHeader,
    }: {
      selected?: Date
      onChange?: (date: Date) => void
      disabled?: boolean
      renderCustomHeader?: (params: {
        date: Date
        decreaseMonth: () => void
        increaseMonth: () => void
        prevMonthButtonDisabled: boolean
        nextMonthButtonDisabled: boolean
      }) => React.ReactNode
    }) => (
      <div data-testid="date-picker">
        <input
          type="date"
          value={selected?.toISOString().split('T')[0] || ''}
          onChange={(e) => onChange && onChange(new Date(e.target.value))}
          disabled={disabled}
        />
        <input
          type="time"
          value={selected ? 
            `${selected.getHours().toString().padStart(2, '0')}:${selected.getMinutes().toString().padStart(2, '0')}` 
            : ''
          }
          onChange={(e) => {
            if (onChange && selected) {
              const [hours, minutes] = e.target.value.split(':')
              const newDate = new Date(selected)
              newDate.setHours(parseInt(hours), parseInt(minutes))
              onChange(newDate)
            }
          }}
          disabled={disabled}
        />
        {renderCustomHeader && 
          renderCustomHeader({
            date: selected || new Date(),
            decreaseMonth: jest.fn(),
            increaseMonth: jest.fn(),
            prevMonthButtonDisabled: false,
            nextMonthButtonDisabled: false,
          })
        }
      </div>
    )
    MockComponent.displayName = 'MockDatePicker'
    return MockComponent
  }
})

describe('TimerDisplay', () => {
  const mockHandleDateChange = jest.fn()
  
  const defaultProps = {
    isRunning: false,
    displayTime: '00:15:30',
    initialStartTime: new Date('2023-12-25T10:30:00Z'),
    handleDateChange: mockHandleDateChange,
    isTimerRunning: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Timer display section', () => {
    it('should render timer icon and display time', () => {
      render(<TimerDisplay {...defaultProps} />)

      expect(screen.getByTestId('timer-icon')).toBeInTheDocument()
      expect(screen.getByText('00:15:30')).toBeInTheDocument()
    })

    it('should show running state with pulsing icon', () => {
      render(<TimerDisplay {...defaultProps} isRunning={true} />)

      const timerIcon = screen.getByTestId('timer-icon')
      expect(timerIcon).toHaveClass('text-green-500', 'animate-pulse')
    })

    it('should show idle state with muted icon', () => {
      render(<TimerDisplay {...defaultProps} isRunning={false} />)

      const timerIcon = screen.getByTestId('timer-icon')
      expect(timerIcon).toHaveClass('text-muted-foreground')
      expect(timerIcon).not.toHaveClass('animate-pulse')
    })

    it('should display the provided time correctly', () => {
      render(<TimerDisplay {...defaultProps} displayTime="02:45:12" />)

      expect(screen.getByText('02:45:12')).toBeInTheDocument()
    })
  })

  describe('Start time display section', () => {
    it('should show formatted start time when initialStartTime is provided', () => {
      const startTime = new Date('2023-12-25T14:30:00Z')
      render(<TimerDisplay {...defaultProps} initialStartTime={startTime} />)

      expect(screen.getByText(/Started:/)).toBeInTheDocument()
      // The formatted date and time should be displayed
      expect(screen.getByText(/Dec.*25.*2023/)).toBeInTheDocument()
    })

    it('should show "Not Started" when initialStartTime is null', () => {
      render(<TimerDisplay {...defaultProps} initialStartTime={null} />)

      expect(screen.getByText(/Started:/)).toBeInTheDocument()
      expect(screen.getByText('Not Started')).toBeInTheDocument()
    })
  })

  describe('Date picker section', () => {
    it('should render date picker component', () => {
      render(<TimerDisplay {...defaultProps} />)

      expect(screen.getByTestId('date-picker')).toBeInTheDocument()
    })

    it('should pass correct props to date picker', () => {
      render(<TimerDisplay {...defaultProps} />)

      const datePicker = screen.getByTestId('date-picker')
      expect(datePicker).toBeInTheDocument()
      
      // Check that date inputs are populated with correct values
      const dateInput = screen.getByDisplayValue('2023-12-25')
      const timeInput = screen.getByDisplayValue('11:30') // UTC time shows as 11:30
      expect(dateInput).toBeInTheDocument()
      expect(timeInput).toBeInTheDocument()
    })

    it('should disable date picker when timer is running', () => {
      render(<TimerDisplay {...defaultProps} isTimerRunning={true} />)

      const dateInput = screen.getByDisplayValue('2023-12-25')
      const timeInput = screen.getByDisplayValue('11:30')
      
      expect(dateInput).toBeDisabled()
      expect(timeInput).toBeDisabled()
    })

    it('should enable date picker when timer is not running', () => {
      render(<TimerDisplay {...defaultProps} isTimerRunning={false} />)

      const dateInput = screen.getByDisplayValue('2023-12-25')
      const timeInput = screen.getByDisplayValue('11:30')
      
      expect(dateInput).not.toBeDisabled()
      expect(timeInput).not.toBeDisabled()
    })

    it('should call handleDateChange when date is changed', async () => {
      const user = userEvent.setup()
      render(<TimerDisplay {...defaultProps} />)

      const dateInput = screen.getByDisplayValue('2023-12-25')
      await user.clear(dateInput)
      await user.type(dateInput, '2023-12-26')

      expect(mockHandleDateChange).toHaveBeenCalledWith(expect.any(Date))
    })
  })

  describe('Custom header functionality', () => {
    it('should render custom header navigation buttons', () => {
      render(<TimerDisplay {...defaultProps} />)

      // The custom header should render navigation buttons
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument()
      expect(screen.getByLabelText('Next month')).toBeInTheDocument()
      expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
    })

    it('should disable navigation buttons when timer is running', () => {
      render(<TimerDisplay {...defaultProps} isTimerRunning={true} />)

      const prevButton = screen.getByLabelText('Previous month')
      const nextButton = screen.getByLabelText('Next month')
      
      expect(prevButton).toBeDisabled()
      expect(nextButton).toBeDisabled()
    })

    it('should enable navigation buttons when timer is not running', () => {
      render(<TimerDisplay {...defaultProps} isTimerRunning={false} />)

      const prevButton = screen.getByLabelText('Previous month')
      const nextButton = screen.getByLabelText('Next month')
      
      expect(prevButton).not.toBeDisabled()
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Layout and styling', () => {
    it('should have proper container structure', () => {
      render(<TimerDisplay {...defaultProps} />)

      const container = screen.getByText('00:15:30').closest('.flex.flex-col')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'gap-3', 'w-full')
    })

    it('should apply correct styling to time display', () => {
      render(<TimerDisplay {...defaultProps} />)

      const timeDisplay = screen.getByText('00:15:30')
      expect(timeDisplay).toHaveClass(
        'text-6xl',
        'md:text-7xl',
        'font-mono',
        'font-bold',
        'tracking-tighter',
        'text-center',
        'tabular-nums'
      )
    })

    it('should have proper date picker wrapper styling', () => {
      render(<TimerDisplay {...defaultProps} />)

      const datePicker = screen.getByTestId('date-picker')
      const wrapper = datePicker.closest('.datepicker-wrapper')
      expect(wrapper).toHaveClass(
        'datepicker-wrapper',
        'p-1',
        'border',
        'rounded-md',
        'bg-card',
        'shadow-sm',
        'w-full',
        'max-w-xl',
        'overflow-hidden'
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle null initialStartTime gracefully', () => {
      render(<TimerDisplay {...defaultProps} initialStartTime={null} />)

      expect(screen.getByText('Not Started')).toBeInTheDocument()
      expect(screen.getByTestId('date-picker')).toBeInTheDocument()
    })

    it('should handle empty displayTime', () => {
      render(<TimerDisplay {...defaultProps} displayTime="" />)

      // Should still render the time display container
      expect(screen.getByTestId('timer-icon')).toBeInTheDocument()
    })

    it('should handle various time formats', () => {
      const { rerender } = render(<TimerDisplay {...defaultProps} displayTime="0:05:30" />)
      expect(screen.getByText('0:05:30')).toBeInTheDocument()

      rerender(<TimerDisplay {...defaultProps} displayTime="23:59:59" />)
      expect(screen.getByText('23:59:59')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for navigation buttons', () => {
      render(<TimerDisplay {...defaultProps} />)

      expect(screen.getByLabelText('Previous month')).toBeInTheDocument()
      expect(screen.getByLabelText('Next month')).toBeInTheDocument()
    })

    it('should have proper structure for screen readers', () => {
      render(<TimerDisplay {...defaultProps} />)

      // Timer section should be properly structured
      const timerSection = screen.getByTestId('timer-icon').closest('div')
      expect(timerSection).toBeInTheDocument()

      // Start time info should be descriptive
      expect(screen.getByText(/Started:/)).toBeInTheDocument()
    })
  })
})
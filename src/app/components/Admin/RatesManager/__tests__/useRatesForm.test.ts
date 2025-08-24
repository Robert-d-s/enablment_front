import { renderHook, act } from '@testing-library/react'
import { useRatesForm } from '../useRatesForm'

describe('useRatesForm', () => {
  const mockSuccessCallback = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty form values', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      expect(result.current.rateName).toBe('')
      expect(result.current.rateValue).toBe('')
      expect(result.current.formError).toBe(null)
    })
  })

  describe('form field updates', () => {
    it('should update rate name', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      act(() => {
        result.current.setRateName('Standard Rate')
      })

      expect(result.current.rateName).toBe('Standard Rate')
    })

    it('should handle numeric rate value changes', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      const mockEvent = {
        target: { value: '100' }
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleRateValueChange(mockEvent)
      })

      expect(result.current.rateValue).toBe(100) // Returns number, not string
      expect(result.current.formError).toBe(null)
    })

    it('should handle decimal input by converting to integer', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      const mockEvent = {
        target: { value: '150.50' }
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleRateValueChange(mockEvent)
      })

      expect(result.current.rateValue).toBe(150) // Parsed as integer
      expect(result.current.formError).toBe(null)
    })

    it('should handle non-numeric rate values', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      const mockEvent = {
        target: { value: 'invalid' }
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleRateValueChange(mockEvent)
      })

      expect(result.current.rateValue).toBe(0) // Defaults to 0 for invalid input
      expect(result.current.formError).toBe('Rate value must be a number.')
    })

    it('should handle empty rate value input', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      const mockEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleRateValueChange(mockEvent)
      })

      expect(result.current.rateValue).toBe('')
      expect(result.current.formError).toBe(null)
    })
  })

  describe('form validation', () => {
    it('should validate successful form with all required fields', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      // Set up form data
      act(() => {
        result.current.setRateName('Standard Rate')
        result.current.handleRateValueChange({
          target: { value: '100' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      let isValid: boolean
      act(() => {
        isValid = result.current.validateForm('team-123')
      })

      expect(isValid).toBe(true)
      expect(result.current.formError).toBe(null)
    })

    it('should fail validation without rate name', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      // Set only rate value
      act(() => {
        result.current.handleRateValueChange({
          target: { value: '100' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      let isValid: boolean
      act(() => {
        isValid = result.current.validateForm('team-123')
      })

      expect(isValid).toBe(false)
      expect(result.current.formError).toBe('Please enter a rate name.')
    })

    it('should fail validation without rate value', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      // Set only rate name
      act(() => {
        result.current.setRateName('Standard Rate')
      })

      let isValid: boolean
      act(() => {
        isValid = result.current.validateForm('team-123')
      })

      expect(isValid).toBe(false)
      expect(result.current.formError).toBe('Please enter a valid non-negative rate value.')
    })

    it('should fail validation without team selected', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      // Set up complete form data
      act(() => {
        result.current.setRateName('Standard Rate')
        result.current.handleRateValueChange({
          target: { value: '100' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      let isValid: boolean
      act(() => {
        isValid = result.current.validateForm('')
      })

      expect(isValid).toBe(false)
      expect(result.current.formError).toBe('Please select a team.')
    })

    it('should fail validation with negative rate value', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      act(() => {
        result.current.setRateName('Standard Rate')
        // Set negative value directly
        result.current.handleRateValueChange({
          target: { value: '-50' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      let isValid: boolean
      act(() => {
        isValid = result.current.validateForm('team-123')
      })

      expect(isValid).toBe(false)
      expect(result.current.formError).toBe('Please enter a valid non-negative rate value.')
    })

    it('should handle whitespace-only rate name', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      act(() => {
        result.current.setRateName('   ')
        result.current.handleRateValueChange({
          target: { value: '100' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      let isValid: boolean
      act(() => {
        isValid = result.current.validateForm('team-123')
      })

      expect(isValid).toBe(false)
      expect(result.current.formError).toBe('Please enter a rate name.')
    })
  })

  describe('form reset', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      // Set up form data
      act(() => {
        result.current.setRateName('Standard Rate')
        result.current.handleRateValueChange({
          target: { value: '100' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      // Verify form has data
      expect(result.current.rateName).toBe('Standard Rate')
      expect(result.current.rateValue).toBe(100)

      // Reset form
      act(() => {
        result.current.resetForm()
      })

      // Verify form is reset
      expect(result.current.rateName).toBe('')
      expect(result.current.rateValue).toBe('')
      expect(result.current.formError).toBe(null)
    })

    it('should call success callback on reset', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      act(() => {
        result.current.resetForm()
      })

      expect(mockSuccessCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('should clear error when valid rate value is entered after invalid', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      // Enter invalid value first
      act(() => {
        result.current.handleRateValueChange({
          target: { value: 'invalid' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.formError).toBe('Rate value must be a number.')

      // Enter valid value
      act(() => {
        result.current.handleRateValueChange({
          target: { value: '100' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      expect(result.current.formError).toBe(null)
      expect(result.current.rateValue).toBe(100)
    })

    it('should maintain error state when validation fails', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      // Trigger validation error
      let isValid: boolean
      act(() => {
        isValid = result.current.validateForm('')
      })

      expect(isValid).toBe(false)
      expect(result.current.formError).toBe('Please select a team.')

      // Error should persist until form is properly filled
      expect(result.current.formError).toBe('Please select a team.')
    })
  })

  describe('edge cases', () => {
    it('should handle zero rate values in validation', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      act(() => {
        result.current.setRateName('Free Rate')
        result.current.handleRateValueChange({
          target: { value: '0' }
        } as React.ChangeEvent<HTMLInputElement>)
      })

      let isValid: boolean
      act(() => {
        isValid = result.current.validateForm('team-123')
      })

      expect(isValid).toBe(true) // 0 is valid (non-negative)
      expect(result.current.formError).toBe(null)
    })

    it('should handle rate name with special characters', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      act(() => {
        result.current.setRateName('Senior Developer (Full-time)')
      })

      expect(result.current.rateName).toBe('Senior Developer (Full-time)')
    })

    it('should parse integer values correctly', () => {
      const { result } = renderHook(() => useRatesForm(mockSuccessCallback))

      const testCases = [
        { input: '123', expected: 123 },
        { input: '0', expected: 0 },
        { input: '999', expected: 999 },
        { input: '123.99', expected: 123 }, // Parsed as integer
      ]

      testCases.forEach(({ input, expected }) => {
        act(() => {
          result.current.handleRateValueChange({
            target: { value: input }
          } as React.ChangeEvent<HTMLInputElement>)
        })

        expect(result.current.rateValue).toBe(expected)
      })
    })
  })
})
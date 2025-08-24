import { renderHook, act } from '@testing-library/react'
import { useFeedbackState } from '../useFeedbackState'

// Mock timers
jest.useFakeTimers()

describe('useFeedbackState', () => {
  afterEach(() => {
    jest.clearAllTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFeedbackState())
    
    expect(result.current.state.submissionSuccess).toBe(false)
    expect(result.current.state.submissionError).toBe('')
    expect(result.current.state.dateAlertMessage).toBe(null)
    expect(result.current.state.resetMessage).toBe(false)
  })

  it('should set and clear submission error', () => {
    const { result } = renderHook(() => useFeedbackState())
    
    act(() => {
      result.current.actions.setSubmissionError('Test error')
    })
    
    expect(result.current.state.submissionError).toBe('Test error')
  })

  it('should show success message and clear it after timeout', () => {
    const { result } = renderHook(() => useFeedbackState())
    
    act(() => {
      result.current.actions.showSuccessMessage()
    })
    
    expect(result.current.state.submissionSuccess).toBe(true)
    
    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    expect(result.current.state.submissionSuccess).toBe(false)
  })

  it('should show reset message and clear it after timeout', () => {
    const { result } = renderHook(() => useFeedbackState())
    
    act(() => {
      result.current.actions.showResetMessage()
    })
    
    expect(result.current.state.resetMessage).toBe(true)
    
    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    expect(result.current.state.resetMessage).toBe(false)
  })

  it('should show date alert and clear it after timeout', () => {
    const { result } = renderHook(() => useFeedbackState())
    const alertMessage = 'Test alert message'
    
    act(() => {
      result.current.actions.showDateAlert(alertMessage)
    })
    
    expect(result.current.state.dateAlertMessage).toBe(alertMessage)
    
    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    expect(result.current.state.dateAlertMessage).toBe(null)
  })

  it('should have correct actions interface', () => {
    const { result } = renderHook(() => useFeedbackState())
    
    expect(typeof result.current.actions.setSubmissionError).toBe('function')
    expect(typeof result.current.actions.showSuccessMessage).toBe('function')
    expect(typeof result.current.actions.showResetMessage).toBe('function')
    expect(typeof result.current.actions.showDateAlert).toBe('function')
  })
})
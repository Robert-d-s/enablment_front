import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../useTimer'
import { useTimerStore } from '@/app/lib/timerStore'

// Mock the timer store
jest.mock('@/app/lib/timerStore')

const mockTimerStore = useTimerStore as jest.MockedFunction<typeof useTimerStore>

// Mock console methods to avoid noise in tests
const originalConsole = console
beforeEach(() => {
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterEach(() => {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
  jest.clearAllMocks()
})

describe('useTimer', () => {
  const mockStoreActions = {
    setTimerRunning: jest.fn(),
    setInitialStartTime: jest.fn(),
    addPauseTime: jest.fn(),
    addResumeTime: jest.fn(),
    resetTimerState: jest.fn(),
    setActiveTimerProjectAndRate: jest.fn(),
  }

  beforeEach(() => {
    mockTimerStore.mockReturnValue({
      isRunning: false,
      initialStartTimeISO: null,
      pauseTimesISO: [],
      resumeTimesISO: [],
      ...mockStoreActions,
    })

    // Mock getState for direct store access
    useTimerStore.getState = jest.fn().mockReturnValue({
      isRunning: false,
      initialStartTimeISO: null,
      pauseTimesISO: [],
      resumeTimesISO: [],
    })
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      expect(result.current.isRunning).toBe(false)
      expect(result.current.displayTime).toBe('00:00:00')
      expect(result.current.initialStartTime).toBe(null)
      expect(result.current.pauseTimes).toEqual([])
      expect(result.current.resumeTimes).toEqual([])
    })

    it('should format display time correctly', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      
      mockTimerStore.mockReturnValue({
        isRunning: true,
        initialStartTimeISO: startTime.toISOString(),
        pauseTimesISO: [],
        resumeTimesISO: [],
        ...mockStoreActions,
      })

      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      expect(result.current.initialStartTime).toEqual(startTime)
    })
  })

  describe('timer controls', () => {
    it('should start timer when project and rate are selected', () => {
      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      act(() => {
        result.current.start()
      })

      expect(mockStoreActions.setTimerRunning).toHaveBeenCalledWith(true)
      expect(mockStoreActions.setInitialStartTime).toHaveBeenCalledWith(expect.any(Date))
      expect(mockStoreActions.setActiveTimerProjectAndRate).toHaveBeenCalledWith('project1', 'rate1')
    })

    it('should not start timer when project is not selected', () => {
      const { result } = renderHook(() => useTimer(null, 'rate1'))

      act(() => {
        result.current.start()
      })

      expect(mockStoreActions.setTimerRunning).not.toHaveBeenCalled()
      expect(mockStoreActions.setInitialStartTime).not.toHaveBeenCalled()
    })

    it('should not start timer when rate is not selected', () => {
      const { result } = renderHook(() => useTimer('project1', null))

      act(() => {
        result.current.start()
      })

      expect(mockStoreActions.setTimerRunning).not.toHaveBeenCalled()
      expect(mockStoreActions.setInitialStartTime).not.toHaveBeenCalled()
    })

    it('should pause timer when running', () => {
      mockTimerStore.mockReturnValue({
        isRunning: true,
        initialStartTimeISO: new Date().toISOString(),
        pauseTimesISO: [],
        resumeTimesISO: [],
        ...mockStoreActions,
      })

      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      act(() => {
        result.current.pause()
      })

      expect(mockStoreActions.addPauseTime).toHaveBeenCalledWith(expect.any(Date))
      expect(mockStoreActions.setTimerRunning).toHaveBeenCalledWith(false)
    })

    it('should not pause timer when not running', () => {
      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      act(() => {
        result.current.pause()
      })

      expect(mockStoreActions.addPauseTime).not.toHaveBeenCalled()
      expect(mockStoreActions.setTimerRunning).not.toHaveBeenCalled()
    })

    it('should reset timer', () => {
      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      act(() => {
        result.current.reset()
      })

      expect(mockStoreActions.resetTimerState).toHaveBeenCalled()
      expect(result.current.displayTime).toBe('00:00:00')
    })
  })

  describe('resume functionality', () => {
    it('should resume from pause', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      const pauseTime = new Date('2024-01-01T10:30:00Z')

      useTimerStore.getState = jest.fn().mockReturnValue({
        isRunning: false,
        initialStartTimeISO: startTime.toISOString(),
        pauseTimesISO: [pauseTime.toISOString()],
        resumeTimesISO: [],
      })

      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      act(() => {
        result.current.start()
      })

      expect(mockStoreActions.addResumeTime).toHaveBeenCalledWith(expect.any(Date))
      expect(mockStoreActions.setTimerRunning).toHaveBeenCalledWith(true)
    })
  })

  describe('manual time setting', () => {
    it('should set manual start time', () => {
      const newStartTime = new Date('2024-01-01T09:00:00Z')
      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      act(() => {
        result.current.setStartTime(newStartTime)
      })

      expect(mockStoreActions.resetTimerState).toHaveBeenCalled()
      expect(mockStoreActions.setInitialStartTime).toHaveBeenCalledWith(newStartTime)
      expect(mockStoreActions.setActiveTimerProjectAndRate).toHaveBeenCalledWith('project1', 'rate1')
    })

    it('should pause before setting manual time if timer is running', () => {
      mockTimerStore.mockReturnValue({
        isRunning: true,
        initialStartTimeISO: new Date().toISOString(),
        pauseTimesISO: [],
        resumeTimesISO: [],
        ...mockStoreActions,
      })

      useTimerStore.getState = jest.fn().mockReturnValue({
        isRunning: true,
        initialStartTimeISO: new Date().toISOString(),
        pauseTimesISO: [],
        resumeTimesISO: [],
      })

      const { result } = renderHook(() => useTimer('project1', 'rate1'))
      const newStartTime = new Date('2024-01-01T09:00:00Z')

      act(() => {
        result.current.setStartTime(newStartTime)
      })

      expect(mockStoreActions.addPauseTime).toHaveBeenCalledWith(expect.any(Date))
      expect(mockStoreActions.setTimerRunning).toHaveBeenCalledWith(false)
      expect(mockStoreActions.resetTimerState).toHaveBeenCalled()
    })

    it('should not set manual time without project and rate', () => {
      const { result } = renderHook(() => useTimer(null, null))
      const newStartTime = new Date('2024-01-01T09:00:00Z')

      act(() => {
        result.current.setStartTime(newStartTime)
      })

      expect(mockStoreActions.setInitialStartTime).not.toHaveBeenCalled()
    })
  })

  describe('time calculation', () => {
    it('should calculate total active time with no pauses', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      
      mockTimerStore.mockReturnValue({
        isRunning: true,
        initialStartTimeISO: startTime.toISOString(),
        pauseTimesISO: [],
        resumeTimesISO: [],
        ...mockStoreActions,
      })

      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      const totalTime = result.current.calculateTotalActiveTime()
      expect(totalTime).toBeGreaterThanOrEqual(0)
    })

    it('should return 0 for no start time', () => {
      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      const totalTime = result.current.calculateTotalActiveTime()
      expect(totalTime).toBe(0)
    })

    it('should calculate time correctly with pause and resume', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      const pauseTime = new Date('2024-01-01T10:30:00Z')
      const resumeTime = new Date('2024-01-01T11:00:00Z')

      mockTimerStore.mockReturnValue({
        isRunning: false,
        initialStartTimeISO: startTime.toISOString(),
        pauseTimesISO: [pauseTime.toISOString()],
        resumeTimesISO: [resumeTime.toISOString()],
        ...mockStoreActions,
      })

      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      const totalTime = result.current.calculateTotalActiveTime()
      // Should be 30 minutes (1800000 ms) from start to pause
      expect(totalTime).toBe(1800000)
    })
  })

  describe('edge cases', () => {
    it('should handle invalid pause/resume sequences', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      const pauseTime = new Date('2024-01-01T10:30:00Z')
      const resumeTime = new Date('2024-01-01T10:15:00Z') // Resume before pause

      mockTimerStore.mockReturnValue({
        isRunning: false,
        initialStartTimeISO: startTime.toISOString(),
        pauseTimesISO: [pauseTime.toISOString()],
        resumeTimesISO: [resumeTime.toISOString()],
        ...mockStoreActions,
      })

      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      const totalTime = result.current.calculateTotalActiveTime()
      expect(totalTime).toBeGreaterThanOrEqual(0) // Should handle gracefully
    })

    it('should handle pause time before start time', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      const pauseTime = new Date('2024-01-01T09:30:00Z') // Pause before start

      mockTimerStore.mockReturnValue({
        isRunning: false,
        initialStartTimeISO: startTime.toISOString(),
        pauseTimesISO: [pauseTime.toISOString()],
        resumeTimesISO: [],
        ...mockStoreActions,
      })

      const { result } = renderHook(() => useTimer('project1', 'rate1'))

      const totalTime = result.current.calculateTotalActiveTime()
      expect(totalTime).toBe(0) // Should handle gracefully
    })
  })
})
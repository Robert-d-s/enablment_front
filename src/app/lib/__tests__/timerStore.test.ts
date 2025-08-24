import { useTimerStore } from '../timerStore'

describe('timerStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTimerStore.getState().resetTimerState()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTimerStore.getState()
      
      expect(state.isRunning).toBe(false)
      expect(state.initialStartTimeISO).toBe(null)
      expect(state.pauseTimesISO).toEqual([])
      expect(state.resumeTimesISO).toEqual([])
      expect(state.activeTimerProjectId).toBe(null)
      expect(state.activeTimerRateId).toBe(null)
    })
  })

  describe('timer control actions', () => {
    it('should set timer running state', () => {
      const { setTimerRunning } = useTimerStore.getState()
      
      setTimerRunning(true)
      expect(useTimerStore.getState().isRunning).toBe(true)
      
      setTimerRunning(false)
      expect(useTimerStore.getState().isRunning).toBe(false)
    })

    it('should set initial start time', () => {
      const { setInitialStartTime } = useTimerStore.getState()
      const startTime = new Date('2024-01-01T10:00:00Z')
      
      setInitialStartTime(startTime)
      expect(useTimerStore.getState().initialStartTimeISO).toBe(startTime.toISOString())
    })

    it('should handle null initial start time', () => {
      const { setInitialStartTime } = useTimerStore.getState()
      
      setInitialStartTime(null)
      expect(useTimerStore.getState().initialStartTimeISO).toBe(null)
    })
  })

  describe('pause and resume functionality', () => {
    it('should add pause times', () => {
      const { addPauseTime } = useTimerStore.getState()
      const pauseTime1 = new Date('2024-01-01T10:30:00Z')
      const pauseTime2 = new Date('2024-01-01T11:30:00Z')
      
      addPauseTime(pauseTime1)
      expect(useTimerStore.getState().pauseTimesISO).toEqual([pauseTime1.toISOString()])
      
      addPauseTime(pauseTime2)
      expect(useTimerStore.getState().pauseTimesISO).toEqual([
        pauseTime1.toISOString(),
        pauseTime2.toISOString(),
      ])
    })

    it('should add resume times', () => {
      const { addResumeTime } = useTimerStore.getState()
      const resumeTime1 = new Date('2024-01-01T10:45:00Z')
      const resumeTime2 = new Date('2024-01-01T11:45:00Z')
      
      addResumeTime(resumeTime1)
      expect(useTimerStore.getState().resumeTimesISO).toEqual([resumeTime1.toISOString()])
      
      addResumeTime(resumeTime2)
      expect(useTimerStore.getState().resumeTimesISO).toEqual([
        resumeTime1.toISOString(),
        resumeTime2.toISOString(),
      ])
    })

    it('should maintain pause/resume sequence', () => {
      const { addPauseTime, addResumeTime } = useTimerStore.getState()
      const pauseTime = new Date('2024-01-01T10:30:00Z')
      const resumeTime = new Date('2024-01-01T10:45:00Z')
      
      addPauseTime(pauseTime)
      addResumeTime(resumeTime)
      
      const state = useTimerStore.getState()
      expect(state.pauseTimesISO).toEqual([pauseTime.toISOString()])
      expect(state.resumeTimesISO).toEqual([resumeTime.toISOString()])
    })
  })

  describe('active project and rate management', () => {
    it('should set active project and rate', () => {
      const { setActiveTimerProjectAndRate } = useTimerStore.getState()
      
      setActiveTimerProjectAndRate('project1', 'rate1')
      
      const state = useTimerStore.getState()
      expect(state.activeTimerProjectId).toBe('project1')
      expect(state.activeTimerRateId).toBe('rate1')
    })

    it('should handle null project and rate', () => {
      const { setActiveTimerProjectAndRate } = useTimerStore.getState()
      
      // First set some values
      setActiveTimerProjectAndRate('project1', 'rate1')
      
      // Then clear them
      setActiveTimerProjectAndRate(null, null)
      
      const state = useTimerStore.getState()
      expect(state.activeTimerProjectId).toBe(null)
      expect(state.activeTimerRateId).toBe(null)
    })
  })

  describe('reset functionality', () => {
    it('should reset all timer state', () => {
      const {
        setTimerRunning,
        setInitialStartTime,
        addPauseTime,
        addResumeTime,
        setActiveTimerProjectAndRate,
        resetTimerState,
      } = useTimerStore.getState()

      // Set up some state
      setTimerRunning(true)
      setInitialStartTime(new Date('2024-01-01T10:00:00Z'))
      addPauseTime(new Date('2024-01-01T10:30:00Z'))
      addResumeTime(new Date('2024-01-01T10:45:00Z'))
      setActiveTimerProjectAndRate('project1', 'rate1')

      // Reset state
      resetTimerState()

      const state = useTimerStore.getState()
      expect(state.isRunning).toBe(false)
      expect(state.initialStartTimeISO).toBe(null)
      expect(state.pauseTimesISO).toEqual([])
      expect(state.resumeTimesISO).toEqual([])
      expect(state.activeTimerProjectId).toBe(null)
      expect(state.activeTimerRateId).toBe(null)
    })
  })

  describe('persistence', () => {
    it('should maintain state across multiple accesses', () => {
      const { setTimerRunning, setInitialStartTime } = useTimerStore.getState()
      const startTime = new Date('2024-01-01T10:00:00Z')

      setTimerRunning(true)
      setInitialStartTime(startTime)

      // Access store again
      const newState = useTimerStore.getState()
      expect(newState.isRunning).toBe(true)
      expect(newState.initialStartTimeISO).toBe(startTime.toISOString())
    })
  })

  describe('state immutability', () => {
    it('should not mutate arrays when adding pause times', () => {
      const { addPauseTime } = useTimerStore.getState()
      const pauseTime1 = new Date('2024-01-01T10:30:00Z')
      const pauseTime2 = new Date('2024-01-01T11:30:00Z')

      addPauseTime(pauseTime1)
      const stateAfterFirst = useTimerStore.getState().pauseTimesISO
      
      addPauseTime(pauseTime2)
      const stateAfterSecond = useTimerStore.getState().pauseTimesISO

      // Ensure new array is created
      expect(stateAfterFirst).not.toBe(stateAfterSecond)
      expect(stateAfterFirst).toEqual([pauseTime1.toISOString()])
      expect(stateAfterSecond).toEqual([pauseTime1.toISOString(), pauseTime2.toISOString()])
    })

    it('should not mutate arrays when adding resume times', () => {
      const { addResumeTime } = useTimerStore.getState()
      const resumeTime1 = new Date('2024-01-01T10:45:00Z')
      const resumeTime2 = new Date('2024-01-01T11:45:00Z')

      addResumeTime(resumeTime1)
      const stateAfterFirst = useTimerStore.getState().resumeTimesISO
      
      addResumeTime(resumeTime2)
      const stateAfterSecond = useTimerStore.getState().resumeTimesISO

      // Ensure new array is created
      expect(stateAfterFirst).not.toBe(stateAfterSecond)
      expect(stateAfterFirst).toEqual([resumeTime1.toISOString()])
      expect(stateAfterSecond).toEqual([resumeTime1.toISOString(), resumeTime2.toISOString()])
    })
  })
})
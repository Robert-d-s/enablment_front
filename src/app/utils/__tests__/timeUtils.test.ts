import {
  formatDateForDisplay,
  formatTimeFromISOString,
  formatElapsedTime,
  formatTimeFromMilliseconds,
} from '../timeUtils'

describe('timeUtils', () => {
  describe('formatDateForDisplay', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15')
      const result = formatDateForDisplay(date)
      expect(result).toMatch(/Monday, January 15, 2024/)
    })

    it('should handle different dates', () => {
      const date = new Date('2024-12-25')
      const result = formatDateForDisplay(date)
      expect(result).toMatch(/Wednesday, December 25, 2024/)
    })
  })

  describe('formatTimeFromISOString', () => {
    it('should format time from ISO string', () => {
      const isoString = '2024-01-15T14:30:45.000Z'
      const result = formatTimeFromISOString(isoString)
      // Note: This will vary based on timezone, so we test the structure
      expect(result).toMatch(/^\d{1,2}:\d{2}:\d{2}$/)
    })

    it('should pad minutes and seconds correctly', () => {
      const isoString = '2024-01-15T09:05:03.000Z'
      const result = formatTimeFromISOString(isoString)
      expect(result).toMatch(/:\d{2}:\d{2}$/) // Ensures padding
    })
  })

  describe('formatElapsedTime', () => {
    it('should format elapsed time for milliseconds', () => {
      const milliseconds = 3661000 // 1 hour, 1 minute, 1 second
      const result = formatElapsedTime(milliseconds)
      expect(result).toBe('01:01:01')
    })

    it('should handle zero time', () => {
      const result = formatElapsedTime(0)
      expect(result).toBe('00:00:00')
    })

    it('should handle minutes only', () => {
      const milliseconds = 125000 // 2 minutes, 5 seconds
      const result = formatElapsedTime(milliseconds)
      expect(result).toBe('00:02:05')
    })

    it('should handle hours correctly', () => {
      const milliseconds = 7323000 // 2 hours, 2 minutes, 3 seconds
      const result = formatElapsedTime(milliseconds)
      expect(result).toBe('02:02:03')
    })
  })

  describe('formatTimeFromMilliseconds', () => {
    it('should format time from milliseconds', () => {
      const ms = 3661000 // 1 hour, 1 minute, 1 second
      const result = formatTimeFromMilliseconds(ms)
      expect(result).toBe('01:01:01')
    })

    it('should handle zero time', () => {
      const result = formatTimeFromMilliseconds(0)
      expect(result).toBe('00:00:00')
    })

    it('should pad single digits', () => {
      const ms = 3000 // 3 seconds
      const result = formatTimeFromMilliseconds(ms)
      expect(result).toBe('00:00:03')
    })

    it('should handle large hours', () => {
      const ms = 36610000 // 10 hours, 10 minutes, 10 seconds
      const result = formatTimeFromMilliseconds(ms)
      expect(result).toBe('10:10:10')
    })
  })
})
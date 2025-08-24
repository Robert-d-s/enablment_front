import { cn } from '../utils'

describe('utils', () => {
  describe('cn (clsx + twMerge)', () => {
    it('should combine class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'not-included')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('not-included')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      expect(result).toContain('base')
      expect(result).toContain('valid')
    })

    it('should merge tailwind classes correctly', () => {
      // This tests the tailwind-merge functionality
      const result = cn('px-2 py-1', 'px-3')
      // tailwind-merge should keep only the last px-* class
      expect(result).toContain('px-3')
      expect(result).not.toContain('px-2')
      expect(result).toContain('py-1')
    })
  })
})
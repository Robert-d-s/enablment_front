import {
  validatePassword,
  isPasswordValid,
  PASSWORD_REQUIREMENTS,
  PASSWORD_ERROR_MESSAGE,
  PASSWORD_REGEX,
} from '../passwordValidation'

describe('passwordValidation', () => {
  describe('validatePassword', () => {
    it('should return valid for a strong password', () => {
      const result = validatePassword('Strong1!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should require password to be provided', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password is required')
    })

    it('should require minimum length', () => {
      const result = validatePassword('Ab1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 6 characters long')
    })

    it('should require uppercase letter', () => {
      const result = validatePassword('lowercase1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should require lowercase letter', () => {
      const result = validatePassword('UPPERCASE1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should require number or special character', () => {
      const result = validatePassword('NoNumbersOrSpecialChars')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain either a number or special character')
    })

    it('should accept password with number only (no special char)', () => {
      const result = validatePassword('Password123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept password with special char only (no number)', () => {
      const result = validatePassword('Password!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return multiple errors for invalid password', () => {
      const result = validatePassword('abc')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3)
      expect(result.errors).toContain('Password must be at least 6 characters long')
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
      expect(result.errors).toContain('Password must contain either a number or special character')
    })
  })

  describe('isPasswordValid', () => {
    it('should return true for valid passwords', () => {
      expect(isPasswordValid('Strong1!')).toBe(true)
      expect(isPasswordValid('Password123')).toBe(true)
      expect(isPasswordValid('MyPassword!')).toBe(true)
    })

    it('should return false for invalid passwords', () => {
      expect(isPasswordValid('')).toBe(false)
      expect(isPasswordValid('short')).toBe(false)
      expect(isPasswordValid('nouppercase1!')).toBe(false)
      expect(isPasswordValid('NOLOWERCASE1!')).toBe(false)
      expect(isPasswordValid('NoNumbers')).toBe(false)
    })
  })

  describe('constants', () => {
    it('should have correct password requirements', () => {
      expect(PASSWORD_REQUIREMENTS.minLength).toBe(6)
      expect(PASSWORD_REQUIREMENTS.requireUppercase).toBe(true)
      expect(PASSWORD_REQUIREMENTS.requireLowercase).toBe(true)
      expect(PASSWORD_REQUIREMENTS.requireNumberOrSpecialChar).toBe(true)
    })

    it('should have password error message', () => {
      expect(PASSWORD_ERROR_MESSAGE).toContain('6 characters')
      expect(PASSWORD_ERROR_MESSAGE).toContain('uppercase')
      expect(PASSWORD_ERROR_MESSAGE).toContain('lowercase')
    })

    it('should have password regex', () => {
      expect(PASSWORD_REGEX).toBeDefined()
      expect(PASSWORD_REGEX.test('Strong1!')).toBe(true)
      expect(PASSWORD_REGEX.test('weak')).toBe(false)
    })
  })
})
/**
 * Password validation utilities
 * 
 * These validation rules match the backend implementation in:
 * /root/tracking-exam/src/auth/auth.service.ts:validatePassword()
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 6,
  requireUppercase: true,
  requireLowercase: true,
  requireNumberOrSpecialChar: true,
} as const;

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d!@#$%^&*(),.?":{}|<>]).{6,}$/;

export const PASSWORD_ERROR_MESSAGE = 
  "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, and either a number or special character.";

/**
 * Validates a password according to the application's security requirements
 * @param password - The password to validate
 * @returns Validation result with detailed error messages
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password) {
    return {
      isValid: false,
      errors: ["Password is required"]
    };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!hasNumbers && !hasSpecialChar) {
    errors.push("Password must contain either a number or special character");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Simple password validation that returns a boolean
 * @param password - The password to validate
 * @returns True if password is valid, false otherwise
 */
export function isPasswordValid(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
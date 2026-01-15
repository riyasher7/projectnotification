// ============================================
// CREATE: src/utils/validation.ts
// ============================================

/**
 * Validate email format using regex
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex (simplified)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email.trim());
}

/**
 * Validate and normalize email
 * @param email - Email address to validate
 * @returns Normalized email or null if invalid
 */
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return null;
  }

  if (normalizedEmail.length > 254) {
    return null;
  }

  return normalizedEmail;
}

/**
 * Get email validation error message
 * @param email - Email address to validate
 * @returns Error message or null if valid
 */
export function getEmailError(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email is required';
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.length > 254) {
    return 'Email is too long';
  }

  if (!isValidEmail(normalizedEmail)) {
    return 'Please enter a valid email address';
  }

  return null;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message or null if valid
 */
export function getPasswordError(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
}
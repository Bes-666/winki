// Validation utilities

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateTelegramId(id: number): boolean {
  return id > 0 && Number.isInteger(id);
}

export function validateSkillName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Skill name is required' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Skill name must be at least 2 characters' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Skill name must be less than 50 characters' };
  }
  return { valid: true };
}

export function validateShares(shares: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(shares) || shares <= 0) {
    return { valid: false, error: 'Shares must be a positive integer' };
  }
  if (shares > 10000) {
    return { valid: false, error: 'Shares cannot exceed 10000' };
  }
  return { valid: true };
}

export function validatePrice(price: number): { valid: boolean; error?: string } {
  if (price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  if (price > 1000000) {
    return { valid: false, error: 'Price cannot exceed 1,000,000' };
  }
  return { valid: true };
}

export function validateBalance(balance: number): { valid: boolean; error?: string } {
  if (balance < 0) {
    return { valid: false, error: 'Balance cannot be negative' };
  }
  return { valid: true };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}



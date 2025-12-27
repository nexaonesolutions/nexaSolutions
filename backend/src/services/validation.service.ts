export function isValidCpf(cpf: string): boolean {
  if (typeof cpf !== 'string') {
    return false;
  }

  // Remove non-digit characters
  cpf = cpf.replace(/[^\d]+/g, '');

  // Check if CPF has 11 digits
  if (cpf.length !== 11) {
    return false;
  }

  // Check for known invalid patterns (all digits are the same)
  if (/^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  // Calculate first verification digit
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false;
  }

  sum = 0;
  // Calculate second verification digit
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false;
  }

  return true;
}

export function isValidPhone(phone: string): boolean {
    if (typeof phone !== 'string') return false;
    // Basic validation for Brazilian phone numbers (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone);
}

export function isValidPassword(password: string): boolean {
    if (typeof password !== 'string' || password.length < 8) {
        return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    return hasUpperCase && hasLowerCase;
}

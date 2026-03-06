export const mapServerErrorToKey = (msg?: string): string | null => {
  if (!msg) return 'auth.loginFailed';
  const m = msg.toLowerCase();

  // Common auth issues
  if ((m.includes('email') && m.includes('password') && m.includes('required')) || m.includes('missing') && m.includes('password')) {
    return 'auth.loginFailed';
  }
  if (m.includes('invalid') || m.includes('credentials') || m.includes('incorrect') || m.includes('not found')) {
    return 'auth.loginFailed';
  }
  if (m.includes('token') && (m.includes('invalid') || m.includes('expired'))) {
    return 'auth.invalid_token';
  }

  // Generic fallback: don't map
  return null;
};

export default mapServerErrorToKey;

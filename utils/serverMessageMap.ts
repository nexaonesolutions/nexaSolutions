export const mapServerErrorToKey = (msg?: string): string | null => {
  if (!msg) return 'auth.loginFailed';
  const m = msg.toLowerCase();

  // Erros de Credenciais
  if (
    m.includes('invalid') ||
    m.includes('credentials') ||
    m.includes('incorrect') ||
    m.includes('not found') ||
    m.includes('unauthorized') ||
    m.includes('401')
  ) {
    return 'auth.loginFailed';
  }

  // Erros de E-mail
  if (m.includes('email') && (m.includes('use') || m.includes('exists'))) {
    return 'auth.emailAlreadyInUse';
  }

  // Erros de CPF e Telefone
  if (m.includes('cpf') && (m.includes('use') || m.includes('exists'))) {
    return 'auth.cpfAlreadyInUse';
  }
  if (m.includes('phone') && (m.includes('use') || m.includes('exists'))) {
    return 'auth.phoneAlreadyInUse';
  }

  // Erros de Formato
  if (m.includes('password') && (m.includes('weak') || m.includes('8 characters'))) {
    return 'auth.invalidPasswordFormat';
  }
  if (m.includes('invalid') && m.includes('cpf')) {
    return 'auth.invalidCpf';
  }
  if (m.includes('token') && (m.includes('invalid') || m.includes('expired'))) {
    return 'auth.invalid_token';
  }

  // Erros de Rede
  if (m.includes('failed to fetch') || m.includes('network error') || m.includes('connection refused')) {
    return 'auth.networkError';
  }

  // Se for uma das chaves que já conhecemos (ex: vinda do AuthContext), retorna ela mesma
  if (m.startsWith('auth.')) return msg;

  return null;
};

export default mapServerErrorToKey;

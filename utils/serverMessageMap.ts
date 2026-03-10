export const mapServerErrorToKey = (msg?: string): string | null => {
  if (!msg) return 'auth.loginFailed';
  const m = msg.toLowerCase();

  // 1. Erros Específicos de Registro / Validação (Prioridade Alta)
  if (m.includes('invalid cpf')) {
    return 'auth.invalidCpf';
  }
  if (m.includes('invalid phone number format')) {
    return 'auth.invalid_phone';
  }
  if (m.includes('password must be at least 8 characters')) {
    return 'auth.invalidPasswordFormat';
  }
  if (m.includes('email, password, cpf, and phone are required')) {
    return 'auth.registrationFailed'; // Era auth.loginFailed, corrigido
  }

  // 2. Erros de Unicidade
  if (m.includes('email') && (m.includes('use') || m.includes('exists'))) {
    return 'auth.emailAlreadyInUse';
  }
  if (m.includes('cpf') && (m.includes('use') || m.includes('exists'))) {
    return 'auth.cpfAlreadyInUse';
  }
  if (m.includes('phone') && (m.includes('use') || m.includes('exists'))) {
    return 'auth.phoneAlreadyInUse';
  }

  // 3. Erros de Credenciais de Login
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

  // 4. Erros de Token e Sessão
  if (m.includes('token') && (m.includes('invalid') || m.includes('expired'))) {
    return 'auth.invalid_token';
  }
  if (m.includes('firebase not initialized')) {
    return 'auth.authServiceError';
  }

  // 5. Erros de Rede
  if (m.includes('failed to fetch') || m.includes('network error') || m.includes('connection refused') || m.includes('serviço de autenticação indiponível')) {
    return 'auth.networkError';
  }

  // Se for uma das chaves que já conhecemos (ex: vinda do AuthContext), retorna ela mesma
  if (m.startsWith('auth.')) return msg;

  return null;
};

export default mapServerErrorToKey;

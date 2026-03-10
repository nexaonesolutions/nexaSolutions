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

  // Erros de Formato (Mapeados das mensagens do backend)
  if (m.includes('password must be at least 8 characters')) {
    return 'auth.invalidPasswordFormat';
  }
  if (m.includes('invalid cpf')) {
    return 'auth.invalidCpf';
  }
  if (m.includes('invalid phone number format')) {
    return 'auth.invalid_phone'; // Corrigido para bater com a chave da translations.ts
  }
  if (m.includes('email, password, cpf, and phone are required')) {
    return 'auth.loginFailed';
  }

  // Erros de Token e Sessão
  if (m.includes('token') && (m.includes('invalid') || m.includes('expired'))) {
    return 'auth.invalid_token';
  }
  if (m.includes('firebase not initialized')) {
    return 'auth.authServiceError';
  }

  // Erros de Rede
  if (m.includes('failed to fetch') || m.includes('network error') || m.includes('connection refused') || m.includes('serviço de autenticação indiponível')) {
    return 'auth.networkError';
  }

  // Se for uma das chaves que já conhecemos (ex: vinda do AuthContext), retorna ela mesma
  if (m.startsWith('auth.')) return msg;

  return null;
};

export default mapServerErrorToKey;

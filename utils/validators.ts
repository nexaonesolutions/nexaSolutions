/**
 * Valida um número de CPF brasileiro.
 * @param cpf O CPF a ser validado (pode conter pontos e traços).
 * @returns `true` se o CPF for válido, `false` caso contrário.
 */
export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  let sum = 0;
  let remainder;
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
};

/**
 * Valida um número de NIF português.
 * @param nif O NIF a ser validado.
 * @returns `true` se o NIF for válido, `false` caso contrário.
 */
export const validateNIF = (nif: string): boolean => {
  nif = nif.replace(/[^\d]+/g, '');
  if (nif.length !== 9) {
    return false;
  }
  let checkDigit = 0;
  for (let i = 0; i < 8; i++) {
    checkDigit += parseInt(nif[i], 10) * (9 - i);
  }
  checkDigit = 11 - (checkDigit % 11);
  return (checkDigit >= 10 ? 0 : checkDigit) === parseInt(nif[8], 10);
};

/**
 * Valida um número de telefone com base na localidade.
 * @param phone O número de telefone a ser validado.
 * @param locale A localidade ('pt-BR' ou 'pt-PT').
 * @returns `true` se o telefone for válido para a localidade, `false` caso contrário.
 */
export const validatePhone = (phone: string, locale: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');

  if (locale === 'pt-BR') {
    // No Brasil, telefones fixos têm 10 dígitos e telemóveis têm 11.
    return digitsOnly.length === 10 || digitsOnly.length === 11;
  }

  if (locale === 'pt-PT' || locale === 'pt') {
    // Em Portugal, números de telemóvel e fixos têm 9 dígitos.
    return digitsOnly.length === 9;
  }

  // Fallback para outras localidades: um mínimo genérico de 7 dígitos.
  return digitsOnly.length >= 7;
};
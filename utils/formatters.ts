/**
 * Aplica a máscara de CPF (000.000.000-00) a uma string.
 * @param value A string a ser formatada.
 * @returns A string formatada com a máscara de CPF.
 */
export const maskCPF = (value: string): string => {
  // Remove tudo que não for dígito
  const digitsOnly = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const truncatedValue = digitsOnly.slice(0, 11);

  // Aplica a máscara de forma progressiva
  return truncatedValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Remove todos os caracteres não numéricos de uma string.
 * Útil para campos como NIF que devem conter apenas números.
 * @param value A string a ser limpa.
 * @param maxLength O comprimento máximo da string resultante.
 * @returns A string contendo apenas dígitos.
 */
export const onlyDigits = (value: string, maxLength?: number): string => {
  let digits = value.replace(/\D/g, '');
  if (maxLength) {
    digits = digits.slice(0, maxLength);
  }
  return digits;
};

/**
 * Aplica a máscara de telefone (brasileiro) a uma string de forma progressiva.
 * Formatos: (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX
 * @param value A string a ser formatada.
 * @returns A string formatada com a máscara de telefone.
 */
export const maskPhone = (value: string): string => {
  // Remove tudo que não for dígito e limita a 11 dígitos (DDD + número)
  const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
  const len = digitsOnly.length;

  if (len === 0) {
    return '';
  }

  // Formato: (XX)
  if (len <= 2) {
    return `(${digitsOnly}`;
  }

  // Formato: (XX)XXXXXXXXX
  return `(${digitsOnly.slice(0, 2)})${digitsOnly.slice(2)}`;
};

export const formatCurrency = (amount: string | number, currency: 'USD' | 'BRL' | 'EUR') => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Fallback for environments where Intl might not be fully supported or for invalid values
    if (isNaN(numericAmount)) {
      return `${currency} ${amount}`;
    }
  
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(numericAmount);
  };
  
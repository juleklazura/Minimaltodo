export const validatePassword = (password: string): { isValid: boolean; strength: number } => {
  let strength = 0;
  
  // Comprimento mínimo
  if (password.length >= 8) strength += 1;
  
  // Contém letra maiúscula
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Contém letra minúscula
  if (/[a-z]/.test(password)) strength += 1;
  
  // Contém número
  if (/[0-9]/.test(password)) strength += 1;
  
  // Contém caractere especial
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return {
    isValid: strength >= 3,
    strength
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  // Nome de usuário deve ter entre 3 e 20 caracteres
  // Pode conter letras, números e underscore
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const getPasswordStrengthText = (strength: number): string => {
  switch (strength) {
    case 0:
    case 1:
      return 'Muito fraca';
    case 2:
      return 'Fraca';
    case 3:
      return 'Média';
    case 4:
      return 'Forte';
    case 5:
      return 'Muito forte';
    default:
      return 'Desconhecida';
  }
}; 
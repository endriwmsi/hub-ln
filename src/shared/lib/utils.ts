import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const normalizeName = (name: string) => {
  return name
    .trim()
    .replace(/\s+g/g, " ")
    .replace(/[^a-zA-Z\s'-]/g, "")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatPhone(phone: string): string {
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}
// Funções de limpeza
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

// Validação de CPF
export function isValidCPF(cpf: string): boolean {
  const cleanedCPF = cleanCPF(cpf);

  if (cleanedCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanedCPF)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder: number;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += Number.parseInt(cleanedCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number.parseInt(cleanedCPF.substring(9, 10))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += Number.parseInt(cleanedCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number.parseInt(cleanedCPF.substring(10, 11))) return false;

  return true;
}

// Validação de CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const cleanedCNPJ = cleanCNPJ(cnpj);

  if (cleanedCNPJ.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanedCNPJ)) return false;

  // Validação dos dígitos verificadores
  let length = cleanedCNPJ.length - 2;
  let numbers = cleanedCNPJ.substring(0, length);
  const digits = cleanedCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  // Valida primeiro dígito verificador
  for (let i = length; i >= 1; i--) {
    sum += Number.parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number.parseInt(digits.charAt(0))) return false;

  // Valida segundo dígito verificador
  length = length + 1;
  numbers = cleanedCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number.parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number.parseInt(digits.charAt(1))) return false;

  return true;
}

// Gera código de afiliado único
export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const getUserInitials = (name: string) => {
  const nameParts = name.trim().split(/\s+/);
  const firstInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : "";
  const lastInitial = nameParts[nameParts.length - 1]
    ? nameParts[nameParts.length - 1][0].toUpperCase()
    : "";
  return nameParts.length > 1 ? `${firstInitial}${lastInitial}` : firstInitial;
};

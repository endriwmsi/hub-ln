"use client";

import { useEffect, useState } from "react";

/**
 * Hook para debounce de valores
 * Útil para evitar muitas requisições em inputs de busca
 *
 * @param value - O valor a ser "debounced"
 * @param delay - O tempo de espera em milissegundos (padrão: 300ms)
 * @returns O valor após o debounce
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

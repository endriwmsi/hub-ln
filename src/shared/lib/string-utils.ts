/**
 * Remove acentos, pontos e normaliza string para busca
 * @param str String a ser normalizada
 * @returns String normalizada (lowercase, sem acentos, sem pontos/traços)
 */
export function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas de acento
    .replace(/[.\-/]/g, ""); // Remove pontos, traços e barras
}

/**
 * Verifica se uma string contém outra (normalizado)
 * @param text Texto onde buscar
 * @param searchTerm Termo de busca
 * @returns true se contém (ignorando acentos e pontos)
 */
export function includesNormalized(text: string, searchTerm: string): boolean {
  return normalizeForSearch(text).includes(normalizeForSearch(searchTerm));
}

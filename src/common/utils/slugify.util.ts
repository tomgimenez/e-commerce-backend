export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')                    // descompone acentos: é → e +  ́
    .replace(/[\u0300-\u036f]/g, '')     // elimina los diacríticos
    .replace(/[^a-z0-9\s-]/g, '')        // elimina caracteres especiales
    .trim()
    .replace(/\s+/g, '-')               // espacios → guiones
    .replace(/-+/g, '-');               // guiones múltiples → uno solo
}

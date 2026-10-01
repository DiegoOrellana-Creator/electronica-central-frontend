/** Normaliza texto para comparar sin distinguir mayusculas ni acentos. */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

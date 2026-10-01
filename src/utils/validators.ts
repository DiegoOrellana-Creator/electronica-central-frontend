const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export type ResultadoPrecio = { valor: number } | { error: string }

/** Interpreta un precio escrito con coma o punto decimal (hasta 2 decimales, mayor o igual a 0). */
export function parsePrecio(texto: string): ResultadoPrecio {
  const limpio = texto.trim().replace(',', '.')
  if (!limpio) return { error: 'Ingrese el precio.' }
  if (!/^-?\d+(\.\d+)?$/.test(limpio)) return { error: 'El precio debe ser un número, por ejemplo 25,50.' }
  const valor = Number(limpio)
  if (valor < 0) return { error: 'El precio no puede ser negativo.' }
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return { error: 'El precio admite hasta 2 decimales.' }
  return { valor }
}

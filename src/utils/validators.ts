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

export interface ReglaContrasena {
  texto: string
  cumple: boolean
}

/** Reglas de contrasena nueva; deben coincidir con las del backend (passwordPolicy.js). */
export function evaluarContrasena(contrasena: string): ReglaContrasena[] {
  return [
    { texto: 'Entre 8 y 128 caracteres', cumple: contrasena.length >= 8 && contrasena.length <= 128 },
    { texto: 'Una letra minúscula', cumple: /\p{Ll}/u.test(contrasena) },
    { texto: 'Una letra mayúscula', cumple: /\p{Lu}/u.test(contrasena) },
    { texto: 'Un número', cumple: /\d/.test(contrasena) },
    { texto: 'Un carácter especial (por ejemplo ! @ # $ %)', cumple: /[^\p{L}\p{N}\s]/u.test(contrasena) },
  ]
}

export const esContrasenaValida = (contrasena: string): boolean =>
  evaluarContrasena(contrasena).every((regla) => regla.cumple)

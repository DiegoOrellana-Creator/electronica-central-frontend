/** Error de negocio simulado. `campo` indica el campo del formulario afectado. */
export class ErrorDeServicio extends Error {
  campo?: string

  constructor(mensaje: string, campo?: string) {
    super(mensaje)
    this.name = 'ErrorDeServicio'
    this.campo = campo
  }
}

export const LATENCIA_LECTURA_MS = 500
export const LATENCIA_ESCRITURA_MS = 600

export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

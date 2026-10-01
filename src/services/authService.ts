export interface Credenciales {
  correo: string
  contrasena: string
  recordar: boolean
}

const RETARDO_SIMULADO_MS = 800

/**
 * Inicio de sesion simulado para el prototipo: no hay backend ni sesion real.
 * Acepta cualquier correo y contrasena no vacios. Al conectar el backend,
 * solo debe cambiar el interior de esta funcion.
 */
export async function iniciarSesion(credenciales: Credenciales): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, RETARDO_SIMULADO_MS))
  if (!credenciales.correo.trim() || !credenciales.contrasena) {
    throw new Error('Credenciales incompletas')
  }
}

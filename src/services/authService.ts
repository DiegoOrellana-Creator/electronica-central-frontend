import { api, ErrorDeApi } from './apiClient'
import { guardarSesion, limpiarSesion } from './sesion'
import type { UsuarioSesion } from './sesion'

export interface Credenciales {
  /** Correo o nombre de usuario (el backend acepta ambos como `identificador`). */
  correo: string
  contrasena: string
  recordar: boolean
}

interface RespuestaLogin {
  token: string
  expiraEn: string
  usuario: UsuarioSesion
}

export async function iniciarSesion({ correo, contrasena, recordar }: Credenciales): Promise<UsuarioSesion> {
  const respuesta = await api<RespuestaLogin>('/api/auth/login', {
    method: 'POST',
    body: { identificador: correo, contrasena },
    auth: false,
  })
  guardarSesion(
    { token: respuesta.token, expiraEn: respuesta.expiraEn, usuario: respuesta.usuario },
    recordar,
  )
  return respuesta.usuario
}

export async function cerrarSesion(): Promise<void> {
  try {
    await api<{ loggedOut: boolean }>('/api/auth/logout', { method: 'POST' })
  } catch (error) {
    // Aunque el servidor falle, la sesion local se elimina igual.
    if (!(error instanceof ErrorDeApi)) throw error
  } finally {
    limpiarSesion()
  }
}

/** Pide el enlace de recuperacion. El backend responde igual exista o no el correo. */
export async function solicitarRecuperacion(correo: string): Promise<void> {
  await api<{ enviado: boolean }>('/api/auth/recuperar', {
    method: 'POST',
    body: { correo },
    auth: false,
  })
}

/** Cambia la contrasena con el token recibido por correo. Lanza ErrorDeApi si el enlace no es valido. */
export async function restablecerContrasena(token: string, contrasenaNueva: string): Promise<void> {
  await api<{ restablecida: boolean }>('/api/auth/restablecer', {
    method: 'POST',
    body: { token, contrasenaNueva },
    auth: false,
  })
}

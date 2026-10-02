/** Usuario autenticado tal como lo devuelve `POST /api/auth/login`. */
export interface UsuarioSesion {
  id: string
  nombreUsuario: string
  correo: string
  roles: string[]
  permisos: string[]
  cambioContrasenaObligatorio: boolean
}

interface SesionGuardada {
  token: string
  expiraEn: string
  usuario: UsuarioSesion
}

const CLAVE = 'ecaz.sesion'

// "Recordarme" guarda la sesion en localStorage (sobrevive al cerrar el navegador);
// si no, en sessionStorage (se borra al cerrar la pestana).
function leerDe(almacen: Storage): SesionGuardada | null {
  try {
    const crudo = almacen.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as SesionGuardada) : null
  } catch {
    return null
  }
}

export function obtenerSesion(): SesionGuardada | null {
  const sesion = leerDe(sessionStorage) ?? leerDe(localStorage)
  if (!sesion) return null
  if (new Date(sesion.expiraEn).getTime() <= Date.now()) {
    limpiarSesion()
    return null
  }
  return sesion
}

export function guardarSesion(sesion: SesionGuardada, recordar: boolean): void {
  limpiarSesion()
  const almacen = recordar ? localStorage : sessionStorage
  almacen.setItem(CLAVE, JSON.stringify(sesion))
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(CLAVE)
  localStorage.removeItem(CLAVE)
}

export const obtenerToken = (): string | null => obtenerSesion()?.token ?? null
export const obtenerUsuario = (): UsuarioSesion | null => obtenerSesion()?.usuario ?? null

export const tienePermiso = (permiso: string): boolean =>
  obtenerUsuario()?.permisos.includes(permiso) ?? false

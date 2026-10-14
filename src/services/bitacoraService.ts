import { api } from './apiClient'
import type { RegistroBitacora, ResultadoBitacora } from '../utils/tipos'

// La bitacora es de solo lectura: el servicio solo expone consulta.

/** Fila tal como la devuelve `GET /api/bitacora`. */
interface FilaBitacora {
  id_registro: string
  fecha_hora: string
  accion: string
  objeto_afectado: string
  resultado: string
  direccion_ip: string | null
  nombre_usuario: string | null
}

const ACCIONES: Record<string, string> = {
  INICIO_SESION: 'Inicio de sesión',
  INICIO_SESION_FALLIDO: 'Intento de inicio de sesión',
  INICIO_SESION_BLOQUEADO: 'Intento con cuenta bloqueada',
  CUENTA_BLOQUEADA: 'Cuenta bloqueada',
  CIERRE_SESION: 'Cierre de sesión',
  CONTRASENA_CAMBIADA: 'Contraseña cambiada',
  CAMBIO_CONTRASENA_FALLIDO: 'Cambio de contraseña fallido',
  RECUPERACION_SOLICITADA: 'Recuperación de contraseña solicitada',
  RECUPERACION_FALLIDA: 'Recuperación de contraseña fallida',
  CONTRASENA_RECUPERADA: 'Contraseña recuperada',
  ACCESO_RESTABLECIDO: 'Acceso restablecido',
  USUARIO_CREADO: 'Usuario creado',
  CLIENTE_CREADO: 'Cliente creado',
  INICIO_SESION_INACTIVO: 'Intento con cuenta inactiva',
  USUARIO_ACTUALIZADO: 'Usuario actualizado',
  USUARIO_ACTIVADO: 'Usuario activado',
  USUARIO_DESACTIVADO: 'Usuario desactivado',
  ROL_CREADO: 'Rol creado',
  ROL_ACTUALIZADO: 'Rol actualizado',
  ROL_ASIGNADO: 'Rol asignado',
  ROL_REVOCADO: 'Rol revocado',
  CATEGORIA_CREADA: 'Categoría creada',
  CATEGORIA_ACTUALIZADA: 'Categoría actualizada',
  CATEGORIA_ACTIVADA: 'Categoría activada',
  CATEGORIA_DESACTIVADA: 'Categoría desactivada',
  UNIDAD_CREADA: 'Unidad de medida creada',
  UNIDAD_ACTUALIZADA: 'Unidad de medida actualizada',
  UNIDAD_ACTIVADA: 'Unidad de medida activada',
  UNIDAD_DESACTIVADA: 'Unidad de medida desactivada',
  PRODUCTO_CREADO: 'Producto creado',
  PRODUCTO_ACTUALIZADO: 'Producto actualizado',
  PRODUCTO_ACTIVADO: 'Producto activado',
  PRODUCTO_DESACTIVADO: 'Producto desactivado',
}

// Acciones cuyo objeto es el nombre de un usuario.
const ACCIONES_DE_USUARIO = new Set([
  'INICIO_SESION',
  'INICIO_SESION_FALLIDO',
  'INICIO_SESION_BLOQUEADO',
  'INICIO_SESION_INACTIVO',
  'CUENTA_BLOQUEADA',
  'CIERRE_SESION',
  'CONTRASENA_CAMBIADA',
  'CAMBIO_CONTRASENA_FALLIDO',
  'RECUPERACION_SOLICITADA',
  'CONTRASENA_RECUPERADA',
])

const MOTIVOS: Record<string, string> = {
  INICIO_SESION_FALLIDO: 'contraseña incorrecta',
  INICIO_SESION_BLOQUEADO: 'cuenta bloqueada',
  INICIO_SESION_INACTIVO: 'cuenta inactiva',
  CAMBIO_CONTRASENA_FALLIDO: 'contraseña actual incorrecta',
}

/** Codigo de la base (INICIO_SESION_FALLIDO) a texto legible. Las acciones desconocidas se adaptan. */
export function nombreDeAccion(codigo: string): string {
  const conocida = ACCIONES[codigo]
  if (conocida) return conocida
  const texto = codigo.replaceAll('_', ' ').toLowerCase()
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function resultadoDeBitacora(crudo: string): ResultadoBitacora {
  const valor = crudo.trim().toUpperCase()
  if (['OK', 'EXITO', 'ÉXITO', 'EXITOSO', 'SUCCESS'].includes(valor)) return 'exito'
  if (['FALLIDO', 'ERROR', 'RECHAZADO', 'DENEGADO'].includes(valor)) return 'error'
  return 'advertencia'
}

export function registroDeFila(fila: FilaBitacora): RegistroBitacora {
  const resultado = resultadoDeBitacora(fila.resultado)
  let objeto = fila.objeto_afectado
  if (objeto === 'IDENTIFICADOR_NO_REGISTRADO') objeto = 'Usuario no registrado'
  else if (ACCIONES_DE_USUARIO.has(fila.accion)) objeto = `Usuario ${objeto}`

  // Segun el estilo de la pantalla, advertencias y errores muestran el motivo entre parentesis.
  if (resultado !== 'exito') {
    const motivo = MOTIVOS[fila.accion] ?? (['FALLIDO', 'BLOQUEADO'].includes(fila.resultado) ? null : fila.resultado)
    if (motivo) objeto = `${objeto} (${motivo})`
  }

  return {
    id: fila.id_registro,
    fechaHora: fila.fecha_hora,
    accion: nombreDeAccion(fila.accion),
    objeto,
    resultado,
    usuario: fila.nombre_usuario ?? 'Sin identificar',
    ip: fila.direccion_ip ?? '—',
  }
}

/** Registros de auditoria, del mas reciente al mas antiguo (el backend entrega hasta 1000). */
export async function listarRegistrosBitacora(): Promise<RegistroBitacora[]> {
  const filas = await api<FilaBitacora[]>('/api/bitacora')
  return filas.map(registroDeFila)
}

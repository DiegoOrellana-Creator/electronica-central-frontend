import { api } from './apiClient'
import { conErrores } from './errores'
import type { EstadoUsuario, Usuario } from '../utils/tipos'

/** Fila tal como la devuelve `GET /api/usuarios`. */
interface FilaUsuario {
  id_usuario: string
  nombre: string | null
  nombre_usuario: string
  correo: string
  activo: boolean
  creado_en: string
  roles_ids: string[]
}

export interface DatosUsuario {
  nombre: string
  correo: string
  estado: EstadoUsuario
  /** Roles asignados (relacion usuario_rol). */
  rolesIds: string[]
  /** Solo al crear: contrasena inicial del usuario. */
  contrasena?: string
}

const aUsuario = (fila: FilaUsuario): Usuario => ({
  id: fila.id_usuario,
  nombre: fila.nombre ?? fila.nombre_usuario,
  correo: fila.correo,
  estado: fila.activo ? 'activo' : 'inactivo',
  rolesIds: fila.roles_ids,
  creadoEn: fila.creado_en,
})

export async function listarUsuarios(): Promise<Usuario[]> {
  const filas = await api<FilaUsuario[]>('/api/usuarios')
  return filas.map(aUsuario)
}

export function crearUsuario(datos: DatosUsuario): Promise<Usuario> {
  return conErrores(async () =>
    aUsuario(
      await api<FilaUsuario>('/api/usuarios', {
        method: 'POST',
        body: {
          nombre: datos.nombre.trim(),
          correo: datos.correo.trim(),
          contrasena: datos.contrasena,
          rolesIds: datos.rolesIds,
          activo: datos.estado === 'activo',
        },
      }),
    ),
  )
}

export function actualizarUsuario(id: string, datos: DatosUsuario): Promise<Usuario> {
  return conErrores(async () =>
    aUsuario(
      await api<FilaUsuario>(`/api/usuarios/${id}`, {
        method: 'PATCH',
        body: {
          nombre: datos.nombre.trim(),
          correo: datos.correo.trim(),
          activo: datos.estado === 'activo',
          rolesIds: datos.rolesIds,
        },
      }),
    ),
  )
}

export function cambiarEstadoUsuario(id: string, estado: EstadoUsuario): Promise<Usuario> {
  return conErrores(async () =>
    aUsuario(await api<FilaUsuario>(`/api/usuarios/${id}/estado`, { method: 'PATCH', body: { activo: estado === 'activo' } })),
  )
}

export function asignarRolUsuario(usuarioId: string, rolId: string): Promise<Usuario> {
  return conErrores(async () =>
    aUsuario(await api<FilaUsuario>(`/api/usuarios/${usuarioId}/roles`, { method: 'POST', body: { idRol: rolId } })),
  )
}

export function revocarRolUsuario(usuarioId: string, rolId: string): Promise<Usuario> {
  return conErrores(async () =>
    aUsuario(await api<FilaUsuario>(`/api/usuarios/${usuarioId}/roles/${rolId}`, { method: 'DELETE' })),
  )
}

import { api } from './apiClient'
import { conErrores } from './errores'
import type { Permiso, Rol } from '../utils/tipos'

interface FilaRol {
  id_rol: string
  nombre: string
  descripcion: string | null
  permisos_ids: string[]
}

interface FilaPermiso {
  id_permiso: string
  nombre: string
  modulo: string
}

export interface DatosRol {
  nombre: string
  descripcion: string
  permisosIds: string[]
}

const aRol = (fila: FilaRol): Rol => ({
  id: fila.id_rol,
  nombre: fila.nombre,
  descripcion: fila.descripcion ?? '',
  permisosIds: fila.permisos_ids,
})

export async function listarRoles(): Promise<Rol[]> {
  return (await api<FilaRol[]>('/api/roles')).map(aRol)
}

export async function listarPermisos(): Promise<Permiso[]> {
  const filas = await api<FilaPermiso[]>('/api/permisos')
  return filas.map((fila) => ({ id: fila.id_permiso, nombre: fila.nombre, modulo: fila.modulo }))
}

export function crearRol(datos: DatosRol): Promise<Rol> {
  return conErrores(async () => aRol(await api<FilaRol>('/api/roles', { method: 'POST', body: datos })))
}

export function actualizarRol(id: string, datos: DatosRol): Promise<Rol> {
  return conErrores(async () => aRol(await api<FilaRol>(`/api/roles/${id}`, { method: 'PATCH', body: datos })))
}

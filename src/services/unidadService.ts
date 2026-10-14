import { api } from './apiClient'
import { conErrores } from './errores'
import type { EstadoUnidad, UnidadMedida } from '../utils/tipos'

// No existe eliminacion fisica: una unidad solo se activa o se desactiva.

interface FilaUnidad {
  id_unidad_medida: string
  nombre: string
  simbolo: string
  activo: boolean
}

export interface DatosUnidad {
  nombre: string
  abreviatura: string
  estado: EstadoUnidad
}

const aUnidad = (fila: FilaUnidad): UnidadMedida => ({
  id: fila.id_unidad_medida,
  nombre: fila.nombre,
  abreviatura: fila.simbolo,
  estado: fila.activo ? 'activo' : 'inactivo',
})

const cuerpo = (datos: DatosUnidad) => ({
  nombre: datos.nombre.trim(),
  simbolo: datos.abreviatura.trim(),
  activo: datos.estado === 'activo',
})

export async function listarUnidades(): Promise<UnidadMedida[]> {
  return (await api<FilaUnidad[]>('/api/unidades')).map(aUnidad)
}

export function crearUnidad(datos: DatosUnidad): Promise<UnidadMedida> {
  return conErrores(async () => aUnidad(await api<FilaUnidad>('/api/unidades', { method: 'POST', body: cuerpo(datos) })))
}

export function actualizarUnidad(id: string, datos: DatosUnidad): Promise<UnidadMedida> {
  return conErrores(async () =>
    aUnidad(await api<FilaUnidad>(`/api/unidades/${id}`, { method: 'PATCH', body: cuerpo(datos) })),
  )
}

export function cambiarEstadoUnidad(id: string, estado: EstadoUnidad): Promise<UnidadMedida> {
  return conErrores(async () =>
    aUnidad(await api<FilaUnidad>(`/api/unidades/${id}/estado`, { method: 'PATCH', body: { activo: estado === 'activo' } })),
  )
}

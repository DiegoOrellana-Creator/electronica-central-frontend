import { api } from './apiClient'
import { conErrores } from './errores'
import type { Categoria, EstadoCategoria } from '../utils/tipos'

// No existe eliminacion fisica: una categoria solo se activa o se desactiva.

interface FilaCategoria {
  id_categoria: string
  nombre: string
  descripcion: string | null
  id_categoria_padre: string | null
  activo: boolean
}

export interface DatosCategoria {
  nombre: string
  descripcion: string
  /** Categoria padre, o `null` para una categoria principal. */
  categoriaPadreId: string | null
  estado: EstadoCategoria
}

const aCategoria = (fila: FilaCategoria): Categoria => ({
  id: fila.id_categoria,
  nombre: fila.nombre,
  descripcion: fila.descripcion ?? '',
  categoriaPadreId: fila.id_categoria_padre,
  estado: fila.activo ? 'activo' : 'inactivo',
})

const cuerpo = (datos: DatosCategoria) => ({
  nombre: datos.nombre.trim(),
  descripcion: datos.descripcion.trim(),
  idCategoriaPadre: datos.categoriaPadreId,
  activo: datos.estado === 'activo',
})

export async function listarCategorias(): Promise<Categoria[]> {
  return (await api<FilaCategoria[]>('/api/categorias')).map(aCategoria)
}

export function crearCategoria(datos: DatosCategoria): Promise<Categoria> {
  return conErrores(async () =>
    aCategoria(await api<FilaCategoria>('/api/categorias', { method: 'POST', body: cuerpo(datos) })),
  )
}

export function actualizarCategoria(id: string, datos: DatosCategoria): Promise<Categoria> {
  return conErrores(async () =>
    aCategoria(await api<FilaCategoria>(`/api/categorias/${id}`, { method: 'PATCH', body: cuerpo(datos) })),
  )
}

export function cambiarEstadoCategoria(id: string, estado: EstadoCategoria): Promise<Categoria> {
  return conErrores(async () =>
    aCategoria(
      await api<FilaCategoria>(`/api/categorias/${id}/estado`, { method: 'PATCH', body: { activo: estado === 'activo' } }),
    ),
  )
}

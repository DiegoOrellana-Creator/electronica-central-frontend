import { api } from './apiClient'
import { conErrores } from './errores'
import { listarCategorias } from './categoriaService'
import { listarUnidades } from './unidadService'
import type { Categoria, EstadoProducto, Producto, UnidadMedida } from '../utils/tipos'

/** Fila tal como la devuelve `GET /api/productos`. */
interface FilaProducto {
  id_producto: string
  nombre: string
  descripcion: string | null
  precio_venta: number | string
  activo: boolean
  id_categoria: string
  id_unidad_medida: string
  marca: string | null
  modelo: string | null
}

export interface DatosProducto {
  nombre: string
  descripcion: string
  precio: number
  categoriaId: string
  marca: string
  modelo: string
  unidadId: string
  estado: EstadoProducto
}

const aProducto = (fila: FilaProducto): Producto => ({
  id: fila.id_producto,
  nombre: fila.nombre,
  descripcion: fila.descripcion ?? '',
  precio: Number(fila.precio_venta),
  categoriaId: fila.id_categoria,
  marca: fila.marca ?? '',
  modelo: fila.modelo ?? '',
  unidadId: fila.id_unidad_medida,
  estado: fila.activo ? 'activo' : 'inactivo',
})

// El backend genera el codigo del producto y le asigna la ubicacion "SIN-UBICACION".
const cuerpo = (datos: DatosProducto) => ({
  nombre: datos.nombre.trim(),
  descripcion: datos.descripcion.trim(),
  precioVenta: datos.precio,
  idCategoria: datos.categoriaId,
  idUnidadMedida: datos.unidadId,
  marca: datos.marca.trim(),
  modelo: datos.modelo.trim(),
  activo: datos.estado === 'activo',
})

export async function listarProductos(): Promise<Producto[]> {
  return (await api<FilaProducto[]>('/api/productos')).map(aProducto)
}

/** Categorias disponibles como opciones del formulario. Provienen de `categoriaService` (CU-5). */
export function listarCategoriasParaProductos(): Promise<Categoria[]> {
  return listarCategorias()
}

/** Unidades disponibles como opciones del formulario. Provienen de `unidadService` (CU-8). */
export function listarUnidadesParaProductos(): Promise<UnidadMedida[]> {
  return listarUnidades()
}

export function crearProducto(datos: DatosProducto): Promise<Producto> {
  return conErrores(async () => aProducto(await api<FilaProducto>('/api/productos', { method: 'POST', body: cuerpo(datos) })))
}

export function actualizarProducto(id: string, datos: DatosProducto): Promise<Producto> {
  return conErrores(async () =>
    aProducto(await api<FilaProducto>(`/api/productos/${id}`, { method: 'PATCH', body: cuerpo(datos) })),
  )
}

export function cambiarEstadoProducto(id: string, estado: EstadoProducto): Promise<Producto> {
  return conErrores(async () =>
    aProducto(await api<FilaProducto>(`/api/productos/${id}`, { method: 'PATCH', body: { activo: estado === 'activo' } })),
  )
}

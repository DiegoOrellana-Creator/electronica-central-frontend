import { PRODUCTOS_INICIALES } from '../utils/mockData'
import type { Categoria, EstadoProducto, Producto, UnidadMedida } from '../utils/mockData'
import { normalizeText } from '../utils/text'
import { categoriasActuales, listarCategorias } from './categoriaService'
import { listarUnidades, unidadesActuales } from './unidadService'
import { ErrorDeServicio, LATENCIA_ESCRITURA_MS, LATENCIA_LECTURA_MS, esperar } from './simulacion'

// Almacen en memoria que reemplaza temporalmente al backend. Al conectarlo, solo cambia
// el interior de estas funciones; las firmas y los errores de negocio se mantienen.

export interface DatosProducto {
  nombre: string
  descripcion: string
  precio: number
  categoriaId: number
  marca: string
  modelo: string
  unidadId: number
  estado: EstadoProducto
}

const copiar = (producto: Producto): Producto => ({ ...producto })

let productos: Producto[] = PRODUCTOS_INICIALES.map(copiar)
let siguienteId = Math.max(...productos.map((p) => p.id)) + 1

function buscar(id: number): Producto {
  const producto = productos.find((p) => p.id === id)
  if (!producto) throw new ErrorDeServicio('El producto no existe.')
  return producto
}

function validarDatos(datos: DatosProducto, idActual?: number) {
  if (!categoriasActuales().some((c) => c.id === datos.categoriaId)) {
    throw new ErrorDeServicio('La categoría seleccionada no existe.', 'categoriaId')
  }
  if (!unidadesActuales().some((u) => u.id === datos.unidadId)) {
    throw new ErrorDeServicio('La unidad de medida seleccionada no existe.', 'unidadId')
  }
  const existe = productos.some(
    (p) =>
      p.id !== idActual &&
      normalizeText(p.nombre) === normalizeText(datos.nombre.trim()) &&
      normalizeText(p.marca) === normalizeText(datos.marca.trim()),
  )
  if (existe) throw new ErrorDeServicio('Ya existe un producto con ese nombre y esa marca.', 'nombre')
}

function aplicar(producto: Producto, datos: DatosProducto) {
  producto.nombre = datos.nombre.trim()
  producto.descripcion = datos.descripcion.trim()
  producto.precio = datos.precio
  producto.categoriaId = datos.categoriaId
  producto.marca = datos.marca.trim()
  producto.modelo = datos.modelo.trim()
  producto.unidadId = datos.unidadId
  producto.estado = datos.estado
}

export async function listarProductos(): Promise<Producto[]> {
  await esperar(LATENCIA_LECTURA_MS)
  return productos.map(copiar)
}

/** Categorias disponibles como opciones del formulario. Provienen de `categoriaService` (CU-5). */
export function listarCategoriasParaProductos(): Promise<Categoria[]> {
  return listarCategorias()
}

/** Unidades disponibles como opciones del formulario. Provienen de `unidadService` (CU-8). */
export function listarUnidadesParaProductos(): Promise<UnidadMedida[]> {
  return listarUnidades()
}

export async function crearProducto(datos: DatosProducto): Promise<Producto> {
  await esperar(LATENCIA_ESCRITURA_MS)
  validarDatos(datos)
  const nuevo: Producto = { id: siguienteId++, ...datos }
  aplicar(nuevo, datos)
  productos = [nuevo, ...productos]
  return copiar(nuevo)
}

export async function actualizarProducto(id: number, datos: DatosProducto): Promise<Producto> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const producto = buscar(id)
  validarDatos(datos, id)
  aplicar(producto, datos)
  return copiar(producto)
}

export async function cambiarEstadoProducto(id: number, estado: EstadoProducto): Promise<Producto> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const producto = buscar(id)
  producto.estado = estado
  return copiar(producto)
}

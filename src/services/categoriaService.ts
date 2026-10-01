import { CATEGORIAS_CATALOGO } from '../utils/mockData'
import type { Categoria, EstadoCategoria } from '../utils/mockData'
import { normalizeText } from '../utils/text'
import { ErrorDeServicio, LATENCIA_ESCRITURA_MS, LATENCIA_LECTURA_MS, esperar } from './simulacion'

// Almacen en memoria que reemplaza temporalmente al backend. Al conectarlo, solo cambia
// el interior de estas funciones; las firmas y los errores de negocio se mantienen.
// No existe eliminacion fisica: una categoria solo se activa o se desactiva.

export interface DatosCategoria {
  nombre: string
  descripcion: string
  /** Categoria padre, o `null` para una categoria principal. */
  categoriaPadreId: number | null
  estado: EstadoCategoria
}

const copiar = (categoria: Categoria): Categoria => ({ ...categoria })

let categorias: Categoria[] = CATEGORIAS_CATALOGO.map(copiar)
let siguienteId = Math.max(...categorias.map((c) => c.id)) + 1

function buscar(id: number): Categoria {
  const categoria = categorias.find((c) => c.id === id)
  if (!categoria) throw new ErrorDeServicio('La categoría no existe.')
  return categoria
}

function validarDatos(datos: DatosCategoria, idActual?: number) {
  const nombre = normalizeText(datos.nombre.trim())
  if (!nombre) throw new ErrorDeServicio('Ingrese el nombre de la categoría.', 'nombre')
  if (categorias.some((c) => c.id !== idActual && normalizeText(c.nombre.trim()) === nombre)) {
    throw new ErrorDeServicio('Ya existe una categoría con ese nombre.', 'nombre')
  }

  if (datos.categoriaPadreId === null) return
  const campo = 'categoriaPadreId'
  const padre = categorias.find((c) => c.id === datos.categoriaPadreId)
  if (!padre) throw new ErrorDeServicio('La categoría padre seleccionada no existe.', campo)
  if (idActual === undefined) {
    // Alta: la nueva categoria no tiene hijas, solo se exige que el padre sea principal.
    if (padre.categoriaPadreId !== null) {
      throw new ErrorDeServicio('La categoría padre debe ser una categoría principal.', campo)
    }
    return
  }
  if (padre.id === idActual) {
    throw new ErrorDeServicio('Una categoría no puede ser su propia categoría padre.', campo)
  }
  if (padre.categoriaPadreId === idActual) {
    throw new ErrorDeServicio('Relación circular: la categoría seleccionada es subcategoría de esta.', campo)
  }
  if (categorias.some((c) => c.categoriaPadreId === idActual)) {
    throw new ErrorDeServicio(
      'Esta categoría tiene subcategorías, por lo que no puede depender de otra (máximo dos niveles).',
      campo,
    )
  }
  if (padre.categoriaPadreId !== null) {
    throw new ErrorDeServicio('La categoría padre debe ser una categoría principal.', campo)
  }
}

function aplicar(categoria: Categoria, datos: DatosCategoria) {
  categoria.nombre = datos.nombre.trim()
  categoria.descripcion = datos.descripcion.trim()
  categoria.categoriaPadreId = datos.categoriaPadreId
  categoria.estado = datos.estado
}

/**
 * Consulta sincrona del almacen en memoria, sin latencia simulada. La usan otros servicios
 * (por ejemplo, Productos) para validar referencias; el almacen sigue siendo uno solo.
 */
export function categoriasActuales(): Categoria[] {
  return categorias.map(copiar)
}

export async function listarCategorias(): Promise<Categoria[]> {
  await esperar(LATENCIA_LECTURA_MS)
  return categorias.map(copiar)
}

export async function crearCategoria(datos: DatosCategoria): Promise<Categoria> {
  await esperar(LATENCIA_ESCRITURA_MS)
  validarDatos(datos)
  const nueva: Categoria = { id: siguienteId++, ...datos }
  aplicar(nueva, datos)
  categorias = [...categorias, nueva]
  return copiar(nueva)
}

export async function actualizarCategoria(id: number, datos: DatosCategoria): Promise<Categoria> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const categoria = buscar(id)
  validarDatos(datos, id)
  aplicar(categoria, datos)
  return copiar(categoria)
}

export async function cambiarEstadoCategoria(id: number, estado: EstadoCategoria): Promise<Categoria> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const categoria = buscar(id)
  categoria.estado = estado
  return copiar(categoria)
}

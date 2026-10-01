import { UNIDADES_CATALOGO } from '../utils/mockData'
import type { EstadoUnidad, UnidadMedida } from '../utils/mockData'
import { normalizeText } from '../utils/text'
import { ErrorDeServicio, LATENCIA_ESCRITURA_MS, LATENCIA_LECTURA_MS, esperar } from './simulacion'

// Almacen en memoria que reemplaza temporalmente al backend. Al conectarlo, solo cambia
// el interior de estas funciones; las firmas y los errores de negocio se mantienen.
// No existe eliminacion fisica: una unidad solo se activa o se desactiva.

export interface DatosUnidad {
  nombre: string
  abreviatura: string
  estado: EstadoUnidad
}

const copiar = (unidad: UnidadMedida): UnidadMedida => ({ ...unidad })

let unidades: UnidadMedida[] = UNIDADES_CATALOGO.map(copiar)
let siguienteId = Math.max(...unidades.map((u) => u.id)) + 1

function buscar(id: number): UnidadMedida {
  const unidad = unidades.find((u) => u.id === id)
  if (!unidad) throw new ErrorDeServicio('La unidad de medida no existe.')
  return unidad
}

function validarDatos(datos: DatosUnidad, idActual?: number) {
  const nombre = normalizeText(datos.nombre.trim())
  const abreviatura = normalizeText(datos.abreviatura.trim())
  if (!nombre) throw new ErrorDeServicio('Ingrese el nombre de la unidad.', 'nombre')
  if (!abreviatura) throw new ErrorDeServicio('Ingrese la abreviatura.', 'abreviatura')
  if (unidades.some((u) => u.id !== idActual && normalizeText(u.nombre.trim()) === nombre)) {
    throw new ErrorDeServicio('Ya existe una unidad con ese nombre.', 'nombre')
  }
  if (unidades.some((u) => u.id !== idActual && normalizeText(u.abreviatura.trim()) === abreviatura)) {
    throw new ErrorDeServicio('Ya existe una unidad con esa abreviatura.', 'abreviatura')
  }
}

function aplicar(unidad: UnidadMedida, datos: DatosUnidad) {
  unidad.nombre = datos.nombre.trim()
  unidad.abreviatura = datos.abreviatura.trim()
  unidad.estado = datos.estado
}

/**
 * Consulta sincrona del almacen en memoria, sin latencia simulada. La usan otros servicios
 * (por ejemplo, Productos) para validar referencias; el almacen sigue siendo uno solo.
 */
export function unidadesActuales(): UnidadMedida[] {
  return unidades.map(copiar)
}

export async function listarUnidades(): Promise<UnidadMedida[]> {
  await esperar(LATENCIA_LECTURA_MS)
  return unidades.map(copiar)
}

export async function crearUnidad(datos: DatosUnidad): Promise<UnidadMedida> {
  await esperar(LATENCIA_ESCRITURA_MS)
  validarDatos(datos)
  const nueva: UnidadMedida = { id: siguienteId++, ...datos }
  aplicar(nueva, datos)
  unidades = [...unidades, nueva]
  return copiar(nueva)
}

export async function actualizarUnidad(id: number, datos: DatosUnidad): Promise<UnidadMedida> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const unidad = buscar(id)
  validarDatos(datos, id)
  aplicar(unidad, datos)
  return copiar(unidad)
}

export async function cambiarEstadoUnidad(id: number, estado: EstadoUnidad): Promise<UnidadMedida> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const unidad = buscar(id)
  unidad.estado = estado
  return copiar(unidad)
}

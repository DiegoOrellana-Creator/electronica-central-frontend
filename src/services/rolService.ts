import { PERMISOS, ROLES_INICIALES } from '../utils/mockData'
import type { Permiso, Rol } from '../utils/mockData'
import { normalizeText } from '../utils/text'
import { ErrorDeServicio, LATENCIA_ESCRITURA_MS, LATENCIA_LECTURA_MS, esperar } from './simulacion'

// Almacen en memoria que reemplaza temporalmente al backend (rol y permiso).

export interface DatosRol {
  nombre: string
  descripcion: string
  permisosIds: number[]
}

const copiar = (rol: Rol): Rol => ({ ...rol, permisosIds: [...rol.permisosIds] })

let roles: Rol[] = ROLES_INICIALES.map(copiar)
let siguienteId = Math.max(...roles.map((r) => r.id)) + 1

function validarNombreUnico(nombre: string, idActual?: number) {
  const existe = roles.some(
    (r) => r.id !== idActual && normalizeText(r.nombre) === normalizeText(nombre.trim()),
  )
  if (existe) throw new ErrorDeServicio('Ya existe un rol con ese nombre.', 'nombre')
}

export async function listarRoles(): Promise<Rol[]> {
  await esperar(LATENCIA_LECTURA_MS)
  return roles.map(copiar)
}

export async function listarPermisos(): Promise<Permiso[]> {
  await esperar(LATENCIA_LECTURA_MS)
  return PERMISOS.map((permiso) => ({ ...permiso }))
}

export async function crearRol(datos: DatosRol): Promise<Rol> {
  await esperar(LATENCIA_ESCRITURA_MS)
  validarNombreUnico(datos.nombre)
  const nuevo: Rol = {
    id: siguienteId++,
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    permisosIds: [...datos.permisosIds],
  }
  roles = [...roles, nuevo]
  return copiar(nuevo)
}

export async function actualizarRol(id: number, datos: DatosRol): Promise<Rol> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const rol = roles.find((r) => r.id === id)
  if (!rol) throw new ErrorDeServicio('El rol no existe.')
  validarNombreUnico(datos.nombre, id)
  rol.nombre = datos.nombre.trim()
  rol.descripcion = datos.descripcion.trim()
  rol.permisosIds = [...datos.permisosIds]
  return copiar(rol)
}

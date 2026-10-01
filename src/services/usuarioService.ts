import { USUARIOS_INICIALES } from '../utils/mockData'
import type { EstadoUsuario, Usuario } from '../utils/mockData'
import { normalizeText } from '../utils/text'
import { ErrorDeServicio, LATENCIA_ESCRITURA_MS, LATENCIA_LECTURA_MS, esperar } from './simulacion'

// Almacen en memoria que reemplaza temporalmente al backend. Al conectarlo, solo cambia
// el interior de estas funciones; las firmas y los errores de negocio se mantienen.

export interface DatosUsuario {
  nombre: string
  correo: string
  estado: EstadoUsuario
  /** Roles asignados (relacion usuario_rol). */
  rolesIds: number[]
}

const copiar = (usuario: Usuario): Usuario => ({ ...usuario, rolesIds: [...usuario.rolesIds] })

let usuarios: Usuario[] = USUARIOS_INICIALES.map(copiar)
let siguienteId = Math.max(...usuarios.map((u) => u.id)) + 1

function buscar(id: number): Usuario {
  const usuario = usuarios.find((u) => u.id === id)
  if (!usuario) throw new ErrorDeServicio('El usuario no existe.')
  return usuario
}

function validarCorreoUnico(correo: string, idActual?: number) {
  const existe = usuarios.some(
    (u) => u.id !== idActual && normalizeText(u.correo) === normalizeText(correo.trim()),
  )
  if (existe) throw new ErrorDeServicio('Ya existe un usuario con ese correo electrónico.', 'correo')
}

export async function listarUsuarios(): Promise<Usuario[]> {
  await esperar(LATENCIA_LECTURA_MS)
  return usuarios.map(copiar)
}

export async function crearUsuario(datos: DatosUsuario): Promise<Usuario> {
  await esperar(LATENCIA_ESCRITURA_MS)
  validarCorreoUnico(datos.correo)
  const nuevo: Usuario = {
    id: siguienteId++,
    nombre: datos.nombre.trim(),
    correo: datos.correo.trim(),
    estado: datos.estado,
    rolesIds: [...datos.rolesIds],
    creadoEn: new Date().toISOString(),
  }
  usuarios = [nuevo, ...usuarios]
  return copiar(nuevo)
}

export async function actualizarUsuario(id: number, datos: DatosUsuario): Promise<Usuario> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const usuario = buscar(id)
  validarCorreoUnico(datos.correo, id)
  usuario.nombre = datos.nombre.trim()
  usuario.correo = datos.correo.trim()
  usuario.estado = datos.estado
  usuario.rolesIds = [...datos.rolesIds]
  return copiar(usuario)
}

export async function cambiarEstadoUsuario(id: number, estado: EstadoUsuario): Promise<Usuario> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const usuario = buscar(id)
  usuario.estado = estado
  return copiar(usuario)
}

export async function asignarRolUsuario(usuarioId: number, rolId: number): Promise<Usuario> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const usuario = buscar(usuarioId)
  if (usuario.rolesIds.includes(rolId)) {
    throw new ErrorDeServicio('El usuario ya tiene asignado ese rol.', 'rolId')
  }
  usuario.rolesIds = [...usuario.rolesIds, rolId]
  return copiar(usuario)
}

export async function revocarRolUsuario(usuarioId: number, rolId: number): Promise<Usuario> {
  await esperar(LATENCIA_ESCRITURA_MS)
  const usuario = buscar(usuarioId)
  if (!usuario.rolesIds.includes(rolId)) {
    throw new ErrorDeServicio('El usuario no tiene asignado ese rol.', 'rolId')
  }
  usuario.rolesIds = usuario.rolesIds.filter((id) => id !== rolId)
  return copiar(usuario)
}

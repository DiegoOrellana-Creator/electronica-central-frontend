// Tipos de datos del panel. Los identificadores son UUID (texto), tal como los entrega el backend.

// ---------- Seguridad y acceso ----------

/** Modulo al que pertenece un permiso (lo define el backend, por ejemplo "Usuarios y Roles"). */
export type ModuloPermiso = string

export interface Permiso {
  id: string
  nombre: string
  modulo: ModuloPermiso
}

export interface Rol {
  id: string
  nombre: string
  descripcion: string
  permisosIds: string[]
}

export type EstadoUsuario = 'activo' | 'inactivo'

export interface Usuario {
  id: string
  nombre: string
  correo: string
  estado: EstadoUsuario
  /** Roles asignados (relacion usuario_rol). */
  rolesIds: string[]
  /** Fecha de registro en formato ISO 8601. */
  creadoEn: string
}

// ---------- Catalogo ----------

export type EstadoCategoria = 'activo' | 'inactivo'

export interface Categoria {
  id: string
  nombre: string
  descripcion: string
  /** Categoria padre, o `null` si es una categoria principal. La jerarquia es de maximo dos niveles. */
  categoriaPadreId: string | null
  estado: EstadoCategoria
}

export type EstadoUnidad = 'activo' | 'inactivo'

export interface UnidadMedida {
  id: string
  nombre: string
  abreviatura: string
  estado: EstadoUnidad
}

export type EstadoProducto = 'activo' | 'inactivo'

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  /** Precio en bolivianos (Bs). */
  precio: number
  categoriaId: string
  marca: string
  modelo: string
  unidadId: string
  estado: EstadoProducto
}

// ---------- Panel ----------

export type IndicadorId = 'usuarios' | 'roles' | 'productos' | 'categorias' | 'unidadesMedida'

export interface IndicadorResumen {
  id: IndicadorId
  titulo: string
  valor: number
  contexto: string
}

export type ResultadoActividad = 'exitoso' | 'error'

export interface ActividadReciente {
  id: string
  accion: string
  objeto: string
  usuario: string
  /** Fecha y hora en formato ISO 8601. */
  fechaHora: string
  resultado: ResultadoActividad
}

// ---------- Bitacora ----------

export type ResultadoBitacora = 'exito' | 'advertencia' | 'error'

/** Registro de auditoria. Es de solo lectura: la aplicacion nunca lo modifica ni lo elimina. */
export interface RegistroBitacora {
  id: string
  /** Fecha y hora en formato ISO 8601. */
  fechaHora: string
  accion: string
  /** Objeto afectado por la accion. Si hubo advertencia o error, incluye el motivo entre parentesis. */
  objeto: string
  resultado: ResultadoBitacora
  usuario: string
  ip: string
}

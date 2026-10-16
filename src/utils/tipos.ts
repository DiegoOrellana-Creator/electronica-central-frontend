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

// ---------- Inventario (CU-11) ----------

export type TipoAlertaStock = 'AGOTADO' | 'BAJO_MINIMO'

export interface UbicacionFisica {
  idUbicacion: string
  codigo: string
  pasillo: string
  estante: string
}

/** Elemento de la lista de existencias tal como lo entrega `GET /api/inventario`. */
export interface ItemInventario {
  idProducto: string
  codigo: string
  nombre: string
  stockActual: number
  stockMinimo: number
  ubicacion: UbicacionFisica
  alerta: TipoAlertaStock | null
  /** Costo promedio ponderado en Bs. Opcional: solo visible para usuarios con permiso INVENTARIO_GESTIONAR. */
  costoPromedio?: number
  /** Unidad de medida asociada si se resuelve mediante el catálogo. */
  unidadMedida?: string
}

export type TipoMovimientoInventario = 'ENTRADA' | 'SALIDA'

/** Movimiento histórico de inventario tal como lo entrega `GET /api/inventario/:productoId/movimientos`. */
export interface MovimientoInventario {
  idMovimiento: string
  fechaHora: string
  tipo: TipoMovimientoInventario
  cantidad: number
  motivo: string
  idProducto: string
  idUsuario: string
  responsable: string
  /** Costo unitario en Bs. Opcional: solo visible para usuarios con permiso INVENTARIO_GESTIONAR. */
  costoUnitario?: number
}

/** Metadatos de paginacion devueltos por el backend. */
export interface MetaPaginacion {
  pagina: number
  limite: number
  total: number
}

/** Datos requeridos para registrar un ajuste de inventario (Entrada o Salida). */
export interface DatosAjusteInventario {
  idProducto: string
  tipo: TipoMovimientoInventario
  cantidad: number
  motivo: string
  /** Requerido si tipo === 'ENTRADA'. Opcional para 'SALIDA'. */
  costoUnitario?: number
  /** Clave de idempotencia única. Si no se suministra, el servicio la genera. */
  claveIdempotencia?: string
}

/** Respuesta de la API tras registrar un ajuste de inventario. */
export interface ResultadoAjusteInventario {
  movimiento: {
    idMovimiento: string
    tipo: TipoMovimientoInventario
    cantidad: number
    motivo: string
    costoUnitario: number
    fechaHora: string
  }
  existencia: {
    idProducto: string
    stockActual: number
    stockMinimo: number
    costoPromedio: number
  }
}

/** Respuesta tras actualizar el stock mínimo de un producto. */
export interface ResultadoStockMinimo {
  idProducto: string
  stockActual: number
  stockMinimo: number
  costoPromedio: number
}


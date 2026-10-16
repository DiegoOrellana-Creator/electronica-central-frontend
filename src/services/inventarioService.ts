import { api, apiConMeta, ErrorDeApi } from './apiClient'
import { ErrorDeServicio } from './simulacion'
import type {
  DatosAjusteInventario,
  ItemInventario,
  MetaPaginacion,
  MovimientoInventario,
  ResultadoAjusteInventario,
  ResultadoStockMinimo,
} from '../utils/tipos'

/** Opciones de filtrado y paginación para consultar inventario. */
export interface ParametrosConsultaInventario {
  buscar?: string
  pagina?: number
  limite?: number
}

/** Opciones para consultar alertas de inventario. */
export interface ParametrosConsultaAlertas {
  pagina?: number
  limite?: number
}

/** Opciones para consultar movimientos de un producto. */
export interface ParametrosConsultaMovimientos {
  pagina?: number
  limite?: number
  /** Si es true (por defecto), invierte la página actual para mostrar los movimientos más recientes primero. */
  ordenDescendente?: boolean
}

/**
 * Traduce los errores técnicos y de validación de la API a `ErrorDeServicio` con mensajes
 * claros en español y asociación opcional con el campo del formulario afectado.
 */
function traducirErrorInventario(error: unknown): never {
  if (error instanceof ErrorDeApi) {
    const detalle = error.detalle as {
      reason?: string
      fieldErrors?: Record<string, string[]>
      mensaje?: string
      campo?: string
    } | undefined

    const reason = detalle?.reason
    if (reason === 'INSUFFICIENT_STOCK') {
      throw new ErrorDeServicio('Stock insuficiente para realizar la salida solicitada.', 'cantidad')
    }
    if (reason === 'FRACTION_NOT_ALLOWED') {
      throw new ErrorDeServicio('La unidad de medida de este producto no admite cantidades fraccionarias (decimales).', 'cantidad')
    }
    if (reason === 'TOO_MANY_DECIMALS') {
      throw new ErrorDeServicio('La cantidad no puede tener más de 4 posiciones decimales.', 'cantidad')
    }
    if (reason === 'INVALID_QUANTITY') {
      throw new ErrorDeServicio('La cantidad debe ser un número positivo mayor a cero.', 'cantidad')
    }
    if (reason === 'COST_REQUIRED_FOR_ENTRADA') {
      throw new ErrorDeServicio('El costo unitario es obligatorio al registrar una entrada de existencias.', 'costoUnitario')
    }
    if (reason === 'IDEMPOTENCY_PAYLOAD_MISMATCH') {
      throw new ErrorDeServicio('Conflicto: la clave de operación ya fue utilizada con datos diferentes.')
    }

    if (detalle?.fieldErrors) {
      if (detalle.fieldErrors.cantidad?.length) {
        throw new ErrorDeServicio(detalle.fieldErrors.cantidad[0], 'cantidad')
      }
      if (detalle.fieldErrors.costoUnitario?.length) {
        throw new ErrorDeServicio(detalle.fieldErrors.costoUnitario[0], 'costoUnitario')
      }
      if (detalle.fieldErrors.stockMinimo?.length) {
        throw new ErrorDeServicio(detalle.fieldErrors.stockMinimo[0], 'stockMinimo')
      }
      if (detalle.fieldErrors.motivo?.length) {
        throw new ErrorDeServicio(detalle.fieldErrors.motivo[0], 'motivo')
      }
    }

    if (typeof detalle?.mensaje === 'string') {
      throw new ErrorDeServicio(detalle.mensaje, typeof detalle.campo === 'string' ? detalle.campo : undefined)
    }

    if (error.estado === 403) {
      throw new ErrorDeServicio('No tiene permiso para realizar esta acción de inventario.')
    }
    if (error.estado === 404) {
      throw new ErrorDeServicio('El producto o registro de inventario no existe.')
    }
    if (error.estado === 0) {
      throw new ErrorDeServicio('No se pudo conectar con el servidor. Verifique que esté en ejecución.')
    }

    throw new ErrorDeServicio(error.message)
  }

  throw error
}

/**
 * Consulta la lista paginada de existencias de inventario.
 * Requiere permiso `INVENTARIO_CONSULTAR`. Si el usuario carece de `INVENTARIO_GESTIONAR`,
 * el backend automáticamente omite el campo `costoPromedio`.
 */
export async function listarInventario(
  parametros: ParametrosConsultaInventario = {},
): Promise<{ data: ItemInventario[]; meta: MetaPaginacion }> {
  try {
    return await apiConMeta<ItemInventario[], MetaPaginacion>('/api/inventario', {
      query: {
        buscar: parametros.buscar?.trim() || undefined,
        pagina: parametros.pagina ?? 1,
        limite: parametros.limite ?? 20,
      },
    })
  } catch (error) {
    traducirErrorInventario(error)
  }
}

/**
 * Consulta la lista paginada de productos con alertas de stock (agotados o bajo mínimo).
 * Requiere permiso `INVENTARIO_CONSULTAR`.
 */
export async function listarAlertasInventario(
  parametros: ParametrosConsultaAlertas = {},
): Promise<{ data: ItemInventario[]; meta: MetaPaginacion }> {
  try {
    return await apiConMeta<ItemInventario[], MetaPaginacion>('/api/inventario/alertas', {
      query: {
        pagina: parametros.pagina ?? 1,
        limite: parametros.limite ?? 20,
      },
    })
  } catch (error) {
    traducirErrorInventario(error)
  }
}

/**
 * Consulta los movimientos históricos de un producto específico.
 * El backend devuelve los movimientos en orden cronológico ascendente.
 * Por defecto, invierte el arreglo de la página actual para que el operador vea
 * primero los movimientos más recientes.
 * Requiere permiso `INVENTARIO_CONSULTAR`. Si carece de `INVENTARIO_GESTIONAR`, no se incluye `costoUnitario`.
 */
export async function listarMovimientosProducto(
  productoId: string,
  parametros: ParametrosConsultaMovimientos = {},
): Promise<{ data: MovimientoInventario[]; meta: MetaPaginacion }> {
  const { ordenDescendente = true, pagina = 1, limite = 50 } = parametros
  try {
    const respuesta = await apiConMeta<MovimientoInventario[], MetaPaginacion>(
      `/api/inventario/${productoId}/movimientos`,
      {
        query: { pagina, limite },
      },
    )

    return {
      data: ordenDescendente ? [...respuesta.data].reverse() : respuesta.data,
      meta: respuesta.meta,
    }
  } catch (error) {
    traducirErrorInventario(error)
  }
}

/**
 * Actualiza el umbral de stock mínimo de un producto.
 * Requiere permiso `INVENTARIO_GESTIONAR`.
 */
export async function actualizarStockMinimo(
  productoId: string,
  stockMinimo: number,
): Promise<ResultadoStockMinimo> {
  try {
    return await api<ResultadoStockMinimo>(`/api/inventario/${productoId}`, {
      method: 'PATCH',
      body: { stockMinimo },
    })
  } catch (error) {
    traducirErrorInventario(error)
  }
}

/**
 * Registra un ajuste manual de inventario (Entrada o Salida de existencias).
 * Protegido contra reintentos y solicitudes duplicadas mediante clave de idempotencia única.
 * Requiere permiso `INVENTARIO_GESTIONAR`.
 */
export async function registrarAjusteInventario(
  datos: DatosAjusteInventario,
): Promise<ResultadoAjusteInventario> {
  try {
    const claveIdempotencia =
      datos.claveIdempotencia && datos.claveIdempotencia.trim().length > 0
        ? datos.claveIdempotencia.trim()
        : crypto.randomUUID()

    const body: Record<string, unknown> = {
      idProducto: datos.idProducto,
      tipo: datos.tipo,
      cantidad: datos.cantidad,
      motivo: datos.motivo.trim(),
      claveIdempotencia,
    }

    if (datos.tipo === 'ENTRADA' || datos.costoUnitario !== undefined) {
      body.costoUnitario = datos.costoUnitario
    }

    return await api<ResultadoAjusteInventario>('/api/inventario/ajustes', {
      method: 'POST',
      body,
    })
  } catch (error) {
    traducirErrorInventario(error)
  }
}

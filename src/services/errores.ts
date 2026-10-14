import { ErrorDeApi } from './apiClient'
import { ErrorDeServicio } from './simulacion'

const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Su sesión no es válida. Inicie sesión nuevamente.',
  403: 'No tiene permiso para realizar esta acción.',
  404: 'El registro ya no existe.',
  409: 'Ya existe un registro con esos datos.',
  422: 'No se pudo completar la operación.',
}

/**
 * Ejecuta una operacion contra la API y traduce sus errores a `ErrorDeServicio`, que es lo que
 * esperan los formularios. El backend envia en `detalle` el mensaje en espanol (`mensaje`) y el
 * campo afectado (`campo`) cuando el error pertenece a un campo del formulario.
 */
export async function conErrores<T>(operacion: () => Promise<T>): Promise<T> {
  try {
    return await operacion()
  } catch (error) {
    if (!(error instanceof ErrorDeApi)) throw error
    const detalle = error.detalle as { mensaje?: unknown; campo?: unknown } | undefined
    const mensaje =
      typeof detalle?.mensaje === 'string'
        ? detalle.mensaje
        : error.estado === 0
          ? error.message
          : (MENSAJES_POR_ESTADO[error.estado] ?? error.message)
    throw new ErrorDeServicio(mensaje, typeof detalle?.campo === 'string' ? detalle.campo : undefined)
  }
}

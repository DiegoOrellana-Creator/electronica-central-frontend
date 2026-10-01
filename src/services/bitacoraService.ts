import { REGISTROS_BITACORA } from '../utils/mockData'
import type { RegistroBitacora } from '../utils/mockData'
import { LATENCIA_LECTURA_MS, esperar } from './simulacion'

// Almacen en memoria que reemplaza temporalmente al backend. La bitacora es de solo lectura:
// el servicio solo expone consulta, nunca creacion, edicion ni eliminacion de registros.
// Al conectarlo, solo cambia el interior de esta funcion; la firma se mantiene.

/** Registros de auditoria, del mas reciente al mas antiguo. */
export async function listarRegistrosBitacora(): Promise<RegistroBitacora[]> {
  await esperar(LATENCIA_LECTURA_MS)
  return REGISTROS_BITACORA.map((registro) => ({ ...registro })).sort(
    (a, b) => Date.parse(b.fechaHora) - Date.parse(a.fechaHora),
  )
}

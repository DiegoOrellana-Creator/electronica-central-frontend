import { ACTIVIDAD_RECIENTE, INDICADORES_RESUMEN } from '../utils/mockData'

/**
 * Datos del Panel. Por ahora lee datos de demostracion de forma inmediata.
 * Al conectar el backend, aqui se obtendran los datos reales y `cargando`
 * reflejara el estado de la consulta. La pagina no necesita cambios.
 */
export function useDashboardData() {
  const cargando = false
  return {
    cargando,
    indicadores: INDICADORES_RESUMEN,
    actividad: ACTIVIDAD_RECIENTE,
  }
}

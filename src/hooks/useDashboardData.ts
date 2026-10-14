import { useEffect, useState } from 'react'
import { listarRegistrosBitacora } from '../services/bitacoraService'
import { listarCategorias } from '../services/categoriaService'
import { listarProductos } from '../services/productoService'
import { listarRoles } from '../services/rolService'
import { listarUnidades } from '../services/unidadService'
import { listarUsuarios } from '../services/usuarioService'
import type { ActividadReciente, IndicadorResumen } from '../utils/tipos'

interface DatosPanel {
  cargando: boolean
  indicadores: IndicadorResumen[]
  actividad: ActividadReciente[]
}

const ACTIVIDAD_MAXIMA = 6

/**
 * Datos del Panel, calculados con las mismas consultas de cada modulo. Cada fuente es
 * independiente: si el usuario no tiene permiso para una (por ejemplo la bitacora),
 * solo se omite ese indicador o la actividad reciente.
 */
export function useDashboardData(): DatosPanel {
  const [datos, setDatos] = useState<DatosPanel>({ cargando: true, indicadores: [], actividad: [] })

  useEffect(() => {
    let vigente = true
    Promise.allSettled([
      listarUsuarios(),
      listarRoles(),
      listarProductos(),
      listarCategorias(),
      listarUnidades(),
      listarRegistrosBitacora(),
    ]).then(([usuarios, roles, productos, categorias, unidades, bitacora]) => {
      if (!vigente) return
      const indicadores: IndicadorResumen[] = []

      if (usuarios.status === 'fulfilled') {
        const activos = usuarios.value.filter((u) => u.estado === 'activo').length
        indicadores.push({
          id: 'usuarios',
          titulo: 'Usuarios',
          valor: usuarios.value.length,
          contexto: `${activos} activos y ${usuarios.value.length - activos} inactivos`,
        })
      }
      if (roles.status === 'fulfilled') {
        indicadores.push({ id: 'roles', titulo: 'Roles', valor: roles.value.length, contexto: 'Roles definidos en el sistema' })
      }
      if (productos.status === 'fulfilled') {
        const activos = productos.value.filter((p) => p.estado === 'activo').length
        indicadores.push({
          id: 'productos',
          titulo: 'Productos',
          valor: productos.value.length,
          contexto: `${activos} activos en el catálogo`,
        })
      }
      if (categorias.status === 'fulfilled') {
        const principales = categorias.value.filter((c) => c.categoriaPadreId === null).length
        indicadores.push({
          id: 'categorias',
          titulo: 'Categorías',
          valor: categorias.value.length,
          contexto: `${principales} son categorías principales`,
        })
      }
      if (unidades.status === 'fulfilled') {
        indicadores.push({
          id: 'unidadesMedida',
          titulo: 'Unidades de medida',
          valor: unidades.value.length,
          contexto: 'Unidades registradas',
        })
      }

      const actividad: ActividadReciente[] =
        bitacora.status === 'fulfilled'
          ? bitacora.value.slice(0, ACTIVIDAD_MAXIMA).map((registro) => ({
              id: registro.id,
              accion: registro.accion,
              objeto: registro.objeto,
              usuario: registro.usuario,
              fechaHora: registro.fechaHora,
              resultado: registro.resultado === 'exito' ? 'exitoso' : 'error',
            }))
          : []

      setDatos({ cargando: false, indicadores, actividad })
    })
    return () => {
      vigente = false
    }
  }, [])

  return datos
}

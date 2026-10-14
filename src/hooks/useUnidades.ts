import { useCallback, useEffect, useState } from 'react'
import { listarProductos } from '../services/productoService'
import { actualizarUnidad, cambiarEstadoUnidad, crearUnidad, listarUnidades } from '../services/unidadService'
import type { DatosUnidad } from '../services/unidadService'
import type { EstadoUnidad, UnidadMedida } from '../utils/tipos'
import type { EstadoCarga } from './estadoCarga'

/** Unidades de medida con sus operaciones. Hoy usa servicios simulados en memoria. */
export function useUnidades() {
  const [unidades, setUnidades] = useState<UnidadMedida[]>([])
  /** Cantidad de productos que usan cada unidad (solo lectura, informativo). */
  const [productosPorUnidad, setProductosPorUnidad] = useState<ReadonlyMap<string, number>>(new Map())
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.all([listarUnidades(), listarProductos()]).then(
      ([datosUnidades, datosProductos]) => {
        if (!vigente) return
        const conteo = new Map<string, number>()
        for (const producto of datosProductos) {
          conteo.set(producto.unidadId, (conteo.get(producto.unidadId) ?? 0) + 1)
        }
        setUnidades(datosUnidades)
        setProductosPorUnidad(conteo)
        setEstado('listo')
      },
      () => {
        if (vigente) setEstado('error')
      },
    )
    return () => {
      vigente = false
    }
  }, [intento])

  const recargar = useCallback(() => {
    setEstado('cargando')
    setIntento((n) => n + 1)
  }, [])

  const reemplazar = (unidad: UnidadMedida) =>
    setUnidades((prev) => prev.map((u) => (u.id === unidad.id ? unidad : u)))

  const crear = async (datos: DatosUnidad) => {
    const nueva = await crearUnidad(datos)
    setUnidades((prev) => [...prev, nueva])
  }

  const actualizar = async (id: string, datos: DatosUnidad) => {
    reemplazar(await actualizarUnidad(id, datos))
  }

  const cambiarEstado = async (id: string, nuevoEstado: EstadoUnidad) => {
    reemplazar(await cambiarEstadoUnidad(id, nuevoEstado))
  }

  return { unidades, productosPorUnidad, estado, recargar, crear, actualizar, cambiarEstado }
}

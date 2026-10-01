import { useCallback, useEffect, useState } from 'react'
import {
  actualizarCategoria,
  cambiarEstadoCategoria,
  crearCategoria,
  listarCategorias,
} from '../services/categoriaService'
import type { DatosCategoria } from '../services/categoriaService'
import { listarProductos } from '../services/productoService'
import type { Categoria, EstadoCategoria } from '../utils/mockData'
import type { EstadoCarga } from './estadoCarga'

/** Categorias con sus operaciones. Hoy usa servicios simulados en memoria. */
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  /** Cantidad de productos asociados directamente a cada categoria (solo lectura, informativo). */
  const [productosPorCategoria, setProductosPorCategoria] = useState<ReadonlyMap<number, number>>(new Map())
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.all([listarCategorias(), listarProductos()]).then(
      ([datosCategorias, datosProductos]) => {
        if (!vigente) return
        const conteo = new Map<number, number>()
        for (const producto of datosProductos) {
          conteo.set(producto.categoriaId, (conteo.get(producto.categoriaId) ?? 0) + 1)
        }
        setCategorias(datosCategorias)
        setProductosPorCategoria(conteo)
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

  const reemplazar = (categoria: Categoria) =>
    setCategorias((prev) => prev.map((c) => (c.id === categoria.id ? categoria : c)))

  const crear = async (datos: DatosCategoria) => {
    const nueva = await crearCategoria(datos)
    setCategorias((prev) => [...prev, nueva])
  }

  const actualizar = async (id: number, datos: DatosCategoria) => {
    reemplazar(await actualizarCategoria(id, datos))
  }

  const cambiarEstado = async (id: number, nuevoEstado: EstadoCategoria) => {
    reemplazar(await cambiarEstadoCategoria(id, nuevoEstado))
  }

  return { categorias, productosPorCategoria, estado, recargar, crear, actualizar, cambiarEstado }
}

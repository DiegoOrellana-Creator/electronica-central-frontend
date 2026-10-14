import { useCallback, useEffect, useState } from 'react'
import {
  actualizarProducto,
  cambiarEstadoProducto,
  crearProducto,
  listarCategoriasParaProductos,
  listarProductos,
  listarUnidadesParaProductos,
} from '../services/productoService'
import type { DatosProducto } from '../services/productoService'
import type { Categoria, EstadoProducto, Producto, UnidadMedida } from '../utils/tipos'
import type { EstadoCarga } from './estadoCarga'

/** Productos con sus operaciones y las opciones del formulario. Hoy usa servicios simulados en memoria. */
export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidades, setUnidades] = useState<UnidadMedida[]>([])
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.all([listarProductos(), listarCategoriasParaProductos(), listarUnidadesParaProductos()]).then(
      ([datosProductos, datosCategorias, datosUnidades]) => {
        if (!vigente) return
        setProductos(datosProductos)
        setCategorias(datosCategorias)
        setUnidades(datosUnidades)
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

  const reemplazar = (producto: Producto) =>
    setProductos((prev) => prev.map((p) => (p.id === producto.id ? producto : p)))

  const crear = async (datos: DatosProducto) => {
    const nuevo = await crearProducto(datos)
    setProductos((prev) => [nuevo, ...prev])
  }

  const actualizar = async (id: string, datos: DatosProducto) => {
    reemplazar(await actualizarProducto(id, datos))
  }

  const cambiarEstado = async (id: string, nuevoEstado: EstadoProducto) => {
    reemplazar(await cambiarEstadoProducto(id, nuevoEstado))
  }

  return { productos, categorias, unidades, estado, recargar, crear, actualizar, cambiarEstado }
}

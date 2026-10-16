import { useCallback, useEffect, useState } from 'react'
import { listarAlertasInventario, listarInventario } from '../services/inventarioService'
import type { ItemInventario, MetaPaginacion } from '../utils/tipos'
import type { EstadoCarga } from './estadoCarga'

const LIMITE_POR_DEFECTO = 20
const RETARDO_BUSQUEDA_MS = 300

export type VistaInventario = 'todos' | 'alertas'

export function useInventario() {
  const [vista, setVista] = useState<VistaInventario>('todos')
  const [items, setItems] = useState<ItemInventario[]>([])
  const [meta, setMeta] = useState<MetaPaginacion>({ pagina: 1, limite: LIMITE_POR_DEFECTO, total: 0 })
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [error, setError] = useState<string | null>(null)

  // Búsqueda y paginación del servidor
  const [busqueda, setBusqueda] = useState('')
  const [busquedaDebounced, setBusquedaDebounced] = useState('')
  const [pagina, setPagina] = useState(1)
  const [intento, setIntento] = useState(0)

  // Retraso de 300 ms en la búsqueda para optimizar peticiones (solo en vista 'todos')
  useEffect(() => {
    if (vista !== 'todos') return
    const timer = setTimeout(() => {
      const nuevo = busqueda.trim()
      if (nuevo !== busquedaDebounced) {
        setPagina(1)
        setBusquedaDebounced(nuevo)
      }
    }, RETARDO_BUSQUEDA_MS)
    return () => clearTimeout(timer)
  }, [busqueda, busquedaDebounced, vista])

  // Carga de existencias según la vista activa ('todos' o 'alertas')
  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      try {
        const respuesta =
          vista === 'alertas'
            ? await listarAlertasInventario({
                pagina,
                limite: LIMITE_POR_DEFECTO,
              })
            : await listarInventario({
                buscar: busquedaDebounced || undefined,
                pagina,
                limite: LIMITE_POR_DEFECTO,
              })

        if (!vigente) return

        setItems(respuesta.data)
        setMeta(respuesta.meta)
        setError(null)
        setEstado('listo')
      } catch (err) {
        if (!vigente) return
        setError(err instanceof Error ? err.message : 'No se pudo cargar el inventario.')
        setEstado('error')
      }
    }

    cargar()

    return () => {
      vigente = false
    }
  }, [vista, busquedaDebounced, pagina, intento])

  const cambiarVista = useCallback((nuevaVista: VistaInventario) => {
    setVista(nuevaVista)
    setPagina(1)
    setEstado('cargando')
    setError(null)
  }, [])

  const recargar = useCallback(() => {
    setEstado('cargando')
    setError(null)
    setIntento((n) => n + 1)
  }, [])

  const limpiarBusqueda = useCallback(() => {
    setBusqueda('')
    setBusquedaDebounced('')
    setPagina(1)
  }, [])

  return {
    vista,
    cambiarVista,
    items,
    meta,
    estado,
    error,
    busqueda,
    setBusqueda,
    pagina,
    setPagina,
    recargar,
    limpiarBusqueda,
  }
}

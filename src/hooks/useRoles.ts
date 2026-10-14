import { useCallback, useEffect, useState } from 'react'
import { actualizarRol, crearRol, listarPermisos, listarRoles } from '../services/rolService'
import type { DatosRol } from '../services/rolService'
import type { Permiso, Rol } from '../utils/tipos'
import type { EstadoCarga } from './estadoCarga'

/** Roles y permisos con sus operaciones. Hoy usa servicios simulados en memoria. */
export function useRoles() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    Promise.all([listarRoles(), listarPermisos()]).then(
      ([datosRoles, datosPermisos]) => {
        if (!vigente) return
        setRoles(datosRoles)
        setPermisos(datosPermisos)
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

  const crear = async (datos: DatosRol) => {
    const nuevo = await crearRol(datos)
    setRoles((prev) => [...prev, nuevo])
  }

  const actualizar = async (id: string, datos: DatosRol) => {
    const actualizado = await actualizarRol(id, datos)
    setRoles((prev) => prev.map((r) => (r.id === id ? actualizado : r)))
  }

  return { roles, permisos, estado, recargar, crear, actualizar }
}

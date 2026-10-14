import { useCallback, useEffect, useState } from 'react'
import {
  actualizarUsuario,
  asignarRolUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  listarUsuarios,
  revocarRolUsuario,
} from '../services/usuarioService'
import type { DatosUsuario } from '../services/usuarioService'
import type { EstadoUsuario, Usuario } from '../utils/tipos'
import type { EstadoCarga } from './estadoCarga'

/** Usuarios con sus operaciones. Hoy usa servicios simulados en memoria. */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    listarUsuarios().then(
      (datos) => {
        if (!vigente) return
        setUsuarios(datos)
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

  const reemplazar = (usuario: Usuario) =>
    setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? usuario : u)))

  const crear = async (datos: DatosUsuario) => {
    const nuevo = await crearUsuario(datos)
    setUsuarios((prev) => [nuevo, ...prev])
  }

  const actualizar = async (id: string, datos: DatosUsuario) => {
    reemplazar(await actualizarUsuario(id, datos))
  }

  const cambiarEstado = async (id: string, nuevoEstado: EstadoUsuario) => {
    reemplazar(await cambiarEstadoUsuario(id, nuevoEstado))
  }

  const asignarRol = async (usuarioId: string, rolId: string) => {
    reemplazar(await asignarRolUsuario(usuarioId, rolId))
  }

  const revocarRol = async (usuarioId: string, rolId: string) => {
    reemplazar(await revocarRolUsuario(usuarioId, rolId))
  }

  return { usuarios, estado, recargar, crear, actualizar, cambiarEstado, asignarRol, revocarRol }
}

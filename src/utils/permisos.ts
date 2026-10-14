import type { ModuloPermiso, Permiso } from './tipos'

export interface GrupoPermisos {
  modulo: ModuloPermiso
  permisos: Permiso[]
}

/** Agrupa permisos por modulo conservando el orden de aparicion. */
export function agruparPorModulo(permisos: readonly Permiso[]): GrupoPermisos[] {
  const grupos = new Map<ModuloPermiso, Permiso[]>()
  for (const permiso of permisos) {
    const lista = grupos.get(permiso.modulo)
    if (lista) lista.push(permiso)
    else grupos.set(permiso.modulo, [permiso])
  }
  return [...grupos].map(([modulo, lista]) => ({ modulo, permisos: lista }))
}

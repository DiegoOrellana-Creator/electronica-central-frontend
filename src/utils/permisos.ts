import type { ModuloCiclo1, Permiso } from './mockData'

export interface GrupoPermisos {
  modulo: ModuloCiclo1
  permisos: Permiso[]
}

/** Agrupa permisos por modulo conservando el orden de aparicion. */
export function agruparPorModulo(permisos: readonly Permiso[]): GrupoPermisos[] {
  const grupos = new Map<ModuloCiclo1, Permiso[]>()
  for (const permiso of permisos) {
    const lista = grupos.get(permiso.modulo)
    if (lista) lista.push(permiso)
    else grupos.set(permiso.modulo, [permiso])
  }
  return [...grupos].map(([modulo, lista]) => ({ modulo, permisos: lista }))
}

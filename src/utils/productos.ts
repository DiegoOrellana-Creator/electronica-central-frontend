import type { Categoria } from './tipos'

/** Nombre de una categoria precedido por su categoria padre, por ejemplo `Placas de desarrollo › Arduino`. */
export function rutaCategoria(categoria: Categoria | undefined, categorias: readonly Categoria[]): string {
  if (!categoria) return 'Sin categoría'
  const padre = categorias.find((c) => c.id === categoria.categoriaPadreId)
  return padre ? `${padre.nombre} › ${categoria.nombre}` : categoria.nombre
}

import type { Categoria } from '../../utils/mockData'

/** Opciones de un `<select>` de categorias: las subcategorias agrupadas bajo su categoria principal. */
export default function CategoriaOptions({ categorias }: { categorias: readonly Categoria[] }) {
  const principales = categorias.filter((c) => c.categoriaPadreId === null)
  return (
    <>
      {principales.map((principal) => {
        const hijas = categorias.filter((c) => c.categoriaPadreId === principal.id)
        if (hijas.length === 0) {
          return (
            <option key={principal.id} value={principal.id}>
              {principal.nombre}
            </option>
          )
        }
        return (
          <optgroup key={principal.id} label={principal.nombre}>
            {hijas.map((hija) => (
              <option key={hija.id} value={hija.id}>
                {hija.nombre}
              </option>
            ))}
          </optgroup>
        )
      })}
    </>
  )
}

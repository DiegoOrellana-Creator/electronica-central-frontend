import { CheckIcon } from '@phosphor-icons/react'
import type { Permiso } from '../../utils/mockData'
import { agruparPorModulo } from '../../utils/permisos'

interface PermisosPorModuloProps {
  permisos: readonly Permiso[]
}

/** Lista de permisos agrupados por modulo, solo lectura. */
export default function PermisosPorModulo({ permisos }: PermisosPorModuloProps) {
  if (permisos.length === 0) {
    return <p className="text-sm text-slate-600">Sin permisos asociados.</p>
  }
  return (
    <div className="space-y-3">
      {agruparPorModulo(permisos).map((grupo) => (
        <div key={grupo.modulo}>
          <p className="text-xs font-semibold text-slate-600">{grupo.modulo}</p>
          <ul className="mt-1 space-y-1">
            {grupo.permisos.map((permiso) => (
              <li key={permiso.id} className="flex items-center gap-2 text-sm text-slate-800">
                <CheckIcon size={14} weight="bold" aria-hidden="true" className="shrink-0 text-slate-600" />
                {permiso.nombre}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

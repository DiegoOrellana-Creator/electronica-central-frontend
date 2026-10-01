import type { Icon } from '@phosphor-icons/react'

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon: Icon
}

/** Indicador resumido. Debe renderizarse dentro de un `<dl>`. */
export default function StatCard({ title, value, description, icon: StatIcon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-sm font-medium text-slate-600">{title}</dt>
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700"
        >
          <StatIcon size={20} />
        </span>
      </div>
      <dd className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">{value}</dd>
      {description && <dd className="mt-1 text-sm text-slate-600">{description}</dd>}
    </div>
  )
}

import type { ReactNode } from 'react'
import { BRAND_NAME } from '../utils/navigation'

interface AuthCardProps {
  titleId: string
  title: string
  description?: string
  children: ReactNode
}

/** Marco comun de las pantallas publicas (recuperar y restablecer contrasena). */
export default function AuthCard({ titleId, title, description, children }: AuthCardProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <header className="mb-6 flex flex-col items-center gap-3 text-center">
          <p translate="no" className="text-xl font-bold text-slate-900">
            {BRAND_NAME}
          </p>
        </header>
        <section aria-labelledby={titleId} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <h1 id={titleId} className="text-xl font-semibold text-slate-900">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  )
}

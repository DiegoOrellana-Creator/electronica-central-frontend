import { useState } from 'react'
import { EyeIcon, EyeSlashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import Button from '../components/Button'
import Input from '../components/Input'
import { useLoginForm } from '../hooks/useLoginForm'
import { BRAND_NAME } from '../utils/navigation'
import { FOCUS_RING, cn } from '../utils/styles'

export default function Login() {
  const form = useLoginForm()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <header className="mb-6 flex flex-col items-center gap-3 text-center">
          <p translate="no" className="text-xl font-bold text-slate-900">
            {BRAND_NAME}
          </p>
        </header>

        <section
          aria-labelledby="login-title"
          className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <h1 id="login-title" className="text-xl font-semibold text-slate-900">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ingrese sus credenciales para acceder al sistema. Los campos con asterisco (*) son
            obligatorios.
          </p>

          <form onSubmit={form.handleSubmit} noValidate aria-busy={form.loading} className="mt-6 space-y-5">
            {form.formError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
              >
                <WarningCircleIcon size={20} weight="fill" aria-hidden="true" className="shrink-0" />
                <p>{form.formError}</p>
              </div>
            )}

            <Input
              label="Correo electrónico"
              name="correo"
              type="email"
              autoComplete="username"
              spellCheck={false}
              required
              value={form.correo}
              onChange={form.handleCorreoChange}
              error={form.fieldErrors.correo}
              disabled={form.loading}
            />

            <Input
              label="Contraseña"
              name="contrasena"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={form.contrasena}
              onChange={form.handleContrasenaChange}
              error={form.fieldErrors.contrasena}
              disabled={form.loading}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  disabled={form.loading}
                  className={cn(
                    'grid size-10 place-items-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    FOCUS_RING,
                  )}
                >
                  {showPassword ? (
                    <EyeSlashIcon size={20} aria-hidden="true" />
                  ) : (
                    <EyeIcon size={20} aria-hidden="true" />
                  )}
                </button>
              }
            />

            <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="recordar"
                checked={form.recordar}
                onChange={form.handleRecordarChange}
                disabled={form.loading}
                className={cn('size-4 rounded border-slate-300 accent-blue-700', FOCUS_RING)}
              />
              Recordar sesión
            </label>

            <Button type="submit" loading={form.loading} className="w-full">
              {form.loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}

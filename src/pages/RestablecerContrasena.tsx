import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import Alert from '../components/Alert'
import AuthCard from '../components/AuthCard'
import Button from '../components/Button'
import Input from '../components/Input'
import PasswordRules from '../components/PasswordRules'
import { ErrorDeApi } from '../services/apiClient'
import { restablecerContrasena } from '../services/authService'
import { ROUTES } from '../utils/navigation'
import { FOCUS_RING, cn } from '../utils/styles'
import { esContrasenaValida } from '../utils/validators'

const ENLACE = cn('inline-flex min-h-11 items-center rounded-md text-sm font-medium text-blue-800 underline', FOCUS_RING)

export default function RestablecerContrasena() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [errores, setErrores] = useState<{ nueva?: string; confirmar?: string }>({})
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [enlaceInvalido, setEnlaceInvalido] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [listo, setListo] = useState(false)

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (cargando) return
    const nuevosErrores: { nueva?: string; confirmar?: string } = {}
    if (!esContrasenaValida(nueva)) nuevosErrores.nueva = 'La contraseña no cumple todos los requisitos.'
    if (confirmar !== nueva) nuevosErrores.confirmar = 'Las contraseñas no coinciden.'
    setErrores(nuevosErrores)
    if (nuevosErrores.nueva || nuevosErrores.confirmar) return

    setErrorForm(null)
    setCargando(true)
    try {
      await restablecerContrasena(token, nueva)
      setListo(true)
    } catch (error) {
      if (error instanceof ErrorDeApi && error.estado === 400) setEnlaceInvalido(true)
      else if (error instanceof ErrorDeApi && error.estado === 0) setErrorForm(error.message)
      else setErrorForm('No se pudo restablecer la contraseña. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const sinEnlace = token === '' || enlaceInvalido

  return (
    <AuthCard
      titleId="restablecer-title"
      title="Nueva contraseña"
      description={sinEnlace || listo ? undefined : 'Cree una contraseña nueva para su cuenta.'}
    >
      {listo ? (
        <div className="space-y-5">
          <Alert variant="success" title="Contraseña actualizada">
            Ya puede iniciar sesión con su contraseña nueva. Por seguridad se cerraron las sesiones abiertas.
          </Alert>
          <Link to={ROUTES.login} className={ENLACE}>
            Ir a iniciar sesión
          </Link>
        </div>
      ) : sinEnlace ? (
        <div className="space-y-5">
          <Alert variant="error" title="El enlace no es válido">
            El enlace venció, ya fue utilizado o está incompleto. Solicite uno nuevo.
          </Alert>
          <Link to={ROUTES.recuperar} className={ENLACE}>
            Solicitar un enlace nuevo
          </Link>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate aria-busy={cargando} className="space-y-5">
          {errorForm && <Alert variant="error">{errorForm}</Alert>}
          <Input
            label="Contraseña nueva"
            name="nueva"
            type={mostrar ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={nueva}
            onChange={(event) => {
              setNueva(event.target.value)
              setErrores((prev) => ({ ...prev, nueva: undefined }))
            }}
            error={errores.nueva}
            disabled={cargando}
            aria-describedby="reglas-contrasena"
            endAdornment={
              <button
                type="button"
                onClick={() => setMostrar((valor) => !valor)}
                aria-label={mostrar ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                disabled={cargando}
                className={cn(
                  'grid size-10 place-items-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  FOCUS_RING,
                )}
              >
                {mostrar ? <EyeSlashIcon size={20} aria-hidden="true" /> : <EyeIcon size={20} aria-hidden="true" />}
              </button>
            }
          />
          <PasswordRules id="reglas-contrasena" contrasena={nueva} />
          <Input
            label="Confirmar contraseña"
            name="confirmar"
            type={mostrar ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmar}
            onChange={(event) => {
              setConfirmar(event.target.value)
              setErrores((prev) => ({ ...prev, confirmar: undefined }))
            }}
            error={errores.confirmar}
            disabled={cargando}
          />
          <Button type="submit" loading={cargando} className="w-full">
            {cargando ? 'Guardando…' : 'Guardar contraseña'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}

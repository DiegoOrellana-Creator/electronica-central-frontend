import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import AuthCard from '../components/AuthCard'
import Button from '../components/Button'
import Input from '../components/Input'
import { ErrorDeApi } from '../services/apiClient'
import { solicitarRecuperacion } from '../services/authService'
import { ROUTES } from '../utils/navigation'
import { FOCUS_RING, cn } from '../utils/styles'
import { isValidEmail } from '../utils/validators'

const ENLACE_VOLVER = cn('inline-flex min-h-11 items-center rounded-md text-sm font-medium text-blue-800 underline', FOCUS_RING)

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState('')
  const [errorCampo, setErrorCampo] = useState<string>()
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (cargando) return
    if (!isValidEmail(correo)) {
      setErrorCampo('Ingrese un correo electrónico válido.')
      return
    }
    setErrorCampo(undefined)
    setErrorForm(null)
    setCargando(true)
    try {
      await solicitarRecuperacion(correo.trim())
      setEnviado(true)
    } catch (error) {
      setErrorForm(
        error instanceof ErrorDeApi && error.estado === 0
          ? error.message
          : 'No se pudo procesar la solicitud. Intente nuevamente.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthCard
      titleId="recuperar-title"
      title="Recuperar contraseña"
      description="Ingrese el correo de su cuenta y le enviaremos un enlace para crear una contraseña nueva."
    >
      {enviado ? (
        <div className="space-y-5">
          <Alert variant="success" title="Solicitud recibida">
            Si el correo está registrado, recibirá un enlace para restablecer su contraseña. El enlace vale 1 hora y
            solo se puede usar una vez. Revise también la carpeta de correo no deseado.
          </Alert>
          <Link to={ROUTES.login} className={ENLACE_VOLVER}>
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate aria-busy={cargando} className="space-y-5">
          {errorForm && <Alert variant="error">{errorForm}</Alert>}
          <Input
            label="Correo electrónico"
            name="correo"
            type="email"
            autoComplete="email"
            spellCheck={false}
            required
            value={correo}
            onChange={(event) => {
              setCorreo(event.target.value)
              setErrorCampo(undefined)
            }}
            error={errorCampo}
            disabled={cargando}
          />
          <Button type="submit" loading={cargando} className="w-full">
            {cargando ? 'Enviando…' : 'Enviar enlace'}
          </Button>
          <Link to={ROUTES.login} className={ENLACE_VOLVER}>
            Volver a iniciar sesión
          </Link>
        </form>
      )}
    </AuthCard>
  )
}

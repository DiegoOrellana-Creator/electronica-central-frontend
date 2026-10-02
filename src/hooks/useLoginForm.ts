import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../services/authService'
import { ErrorDeApi } from '../services/apiClient'
import { ROUTES } from '../utils/navigation'

export const REQUIRED_FIELDS_MESSAGE = 'Complete los campos requeridos'
const LOGIN_FAILED_MESSAGE = 'No se pudo iniciar sesión. Intente nuevamente.'

/** Mensaje segun la respuesta del backend: cuenta bloqueada, credenciales incorrectas o sin conexion. */
function mensajeDeLogin(error: unknown): string {
  if (!(error instanceof ErrorDeApi)) return LOGIN_FAILED_MESSAGE
  if (error.estado === 0) return error.message
  const detalle = error.detalle as { reason?: string; bloqueadoHasta?: string } | undefined
  if (detalle?.reason === 'ACCOUNT_LOCKED') {
    const hasta = detalle.bloqueadoHasta ? new Date(detalle.bloqueadoHasta) : null
    const hora = hasta && !Number.isNaN(hasta.getTime())
      ? hasta.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
      : null
    return hora
      ? `Cuenta bloqueada por intentos fallidos. Intente de nuevo a las ${hora} o contacte al administrador.`
      : 'Cuenta bloqueada por intentos fallidos. Intente más tarde o contacte al administrador.'
  }
  if (error.estado === 401) return 'Credenciales incorrectas.'
  return LOGIN_FAILED_MESSAGE
}

interface FieldErrors {
  correo?: string
  contrasena?: string
}

/** Estado y validacion simulada del formulario de inicio de sesion (CU-1). */
export function useLoginForm() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCorreoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCorreo(event.target.value)
    setFieldErrors((prev) => ({ ...prev, correo: undefined }))
    setFormError(null)
  }

  const handleContrasenaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setContrasena(event.target.value)
    setFieldErrors((prev) => ({ ...prev, contrasena: undefined }))
    setFormError(null)
  }

  const handleRecordarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRecordar(event.target.checked)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const errors: FieldErrors = {}
    if (!correo.trim()) errors.correo = 'Ingrese su correo electrónico.'
    if (!contrasena) errors.contrasena = 'Ingrese su contraseña.'

    if (errors.correo || errors.contrasena) {
      setFieldErrors(errors)
      setFormError(REQUIRED_FIELDS_MESSAGE)
      const primerCampoInvalido = event.currentTarget.elements.namedItem(
        errors.correo ? 'correo' : 'contrasena',
      )
      if (primerCampoInvalido instanceof HTMLElement) primerCampoInvalido.focus()
      return
    }

    setFieldErrors({})
    setFormError(null)
    setLoading(true)
    try {
      await iniciarSesion({ correo: correo.trim(), contrasena, recordar })
      navigate(ROUTES.dashboard, { replace: true })
    } catch (error) {
      setFormError(mensajeDeLogin(error))
      setLoading(false)
    }
  }

  return {
    correo,
    contrasena,
    recordar,
    fieldErrors,
    formError,
    loading,
    handleCorreoChange,
    handleContrasenaChange,
    handleRecordarChange,
    handleSubmit,
  }
}

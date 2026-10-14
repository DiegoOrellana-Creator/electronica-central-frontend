import { useId, useState } from 'react'
import { flushSync } from 'react-dom'
import type { FormEvent } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import { FieldError } from '../../components/FormField'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import PasswordRules from '../../components/PasswordRules'
import Select from '../../components/Select'
import { ErrorDeServicio } from '../../services/simulacion'
import type { DatosUsuario } from '../../services/usuarioService'
import type { EstadoUsuario, Rol, Usuario } from '../../utils/tipos'
import { focusField } from '../../utils/forms'
import { FOCUS_RING, cn } from '../../utils/styles'
import { esContrasenaValida, isValidEmail } from '../../utils/validators'

interface UsuarioFormModalProps {
  /** Si se indica, el formulario edita a ese usuario; si no, crea uno nuevo. */
  usuario?: Usuario
  roles: readonly Rol[]
  onSubmit: (datos: DatosUsuario) => Promise<void>
  onClose: () => void
}

type Campo = 'nombre' | 'correo' | 'contrasena' | 'rolesIds'
type Errores = Partial<Record<Campo, string>>

const NOMBRE_DEL_CAMPO: Record<Campo, string> = {
  nombre: 'nombre',
  correo: 'correo',
  contrasena: 'contrasena',
  rolesIds: 'roles',
}

export default function UsuarioFormModal({ usuario, roles, onSubmit, onClose }: UsuarioFormModalProps) {
  const editando = usuario !== undefined
  const formId = useId()
  const rolesErrorId = useId()

  const [nombre, setNombre] = useState(usuario?.nombre ?? '')
  const [correo, setCorreo] = useState(usuario?.correo ?? '')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [estado, setEstado] = useState<EstadoUsuario>(usuario?.estado ?? 'activo')
  const [rolesIds, setRolesIds] = useState<string[]>(usuario?.rolesIds ?? [])
  const [errores, setErrores] = useState<Errores>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const limpiarError = (campo: Campo) => {
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
    setFormError(null)
  }

  const alternarRol = (rolId: string) => {
    setRolesIds((prev) => (prev.includes(rolId) ? prev.filter((id) => id !== rolId) : [...prev, rolId]))
    limpiarError('rolesIds')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (guardando) return
    const form = event.currentTarget

    const nuevos: Errores = {}
    if (!nombre.trim()) nuevos.nombre = 'Ingrese el nombre del usuario.'
    if (!correo.trim()) nuevos.correo = 'Ingrese el correo electrónico.'
    else if (!isValidEmail(correo)) nuevos.correo = 'Ingrese un correo electrónico válido.'
    if (!editando && !esContrasenaValida(contrasena)) nuevos.contrasena = 'La contraseña no cumple los requisitos.'
    if (!editando && rolesIds.length === 0) nuevos.rolesIds = 'Seleccione al menos un rol.'

    const primerInvalido = (['nombre', 'correo', 'contrasena', 'rolesIds'] as const).find((campo) => nuevos[campo])
    if (primerInvalido) {
      setErrores(nuevos)
      setFormError('Revise los campos marcados.')
      focusField(form, NOMBRE_DEL_CAMPO[primerInvalido])
      return
    }

    setErrores({})
    setFormError(null)
    setGuardando(true)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        correo: correo.trim(),
        estado,
        rolesIds,
        ...(editando ? {} : { contrasena }),
      })
    } catch (error) {
      if (error instanceof ErrorDeServicio && error.campo === 'correo') {
        flushSync(() => {
          setErrores({ correo: error.message })
          setFormError('Revise los campos marcados.')
          setGuardando(false)
        })
        // Los campos deben estar habilitados antes de poder recibir el foco.
        focusField(form, 'correo')
      } else {
        setFormError(error instanceof Error ? error.message : 'No se pudo guardar el usuario.')
        setGuardando(false)
      }
    }
  }

  return (
    <Modal
      title={editando ? 'Editar usuario' : 'Nuevo usuario'}
      description="Los campos con asterisco (*) son obligatorios."
      busy={guardando}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        <Input
          label="Nombre"
          name="nombre"
          autoComplete="off"
          required
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value)
            limpiarError('nombre')
          }}
          error={errores.nombre}
          disabled={guardando}
        />

        <Input
          label="Correo electrónico"
          name="correo"
          type="email"
          autoComplete="off"
          spellCheck={false}
          required
          value={correo}
          onChange={(event) => {
            setCorreo(event.target.value)
            limpiarError('correo')
          }}
          error={errores.correo}
          disabled={guardando}
        />

        {!editando && (
          <div className="space-y-2">
            <Input
              label="Contraseña inicial"
              name="contrasena"
              type={mostrarContrasena ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={contrasena}
              onChange={(event) => {
                setContrasena(event.target.value)
                limpiarError('contrasena')
              }}
              error={errores.contrasena}
              disabled={guardando}
              aria-describedby="reglas-contrasena-usuario"
              endAdornment={
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((valor) => !valor)}
                  className={cn('rounded px-2 py-1 text-sm font-medium text-blue-800', FOCUS_RING)}
                >
                  {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
                </button>
              }
            />
            <PasswordRules id="reglas-contrasena-usuario" contrasena={contrasena} />
          </div>
        )}

        <Select
          label="Estado"
          name="estado"
          required
          value={estado}
          onChange={(event) => setEstado(event.target.value === 'inactivo' ? 'inactivo' : 'activo')}
          disabled={guardando}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </Select>

        <fieldset disabled={guardando} aria-describedby={errores.rolesIds ? rolesErrorId : undefined}>
          <legend className="text-sm font-medium text-slate-900">
            Roles
            {!editando && (
              <span aria-hidden="true" className="ml-0.5 text-red-700">
                *
              </span>
            )}
          </legend>
          <div className="mt-1.5 space-y-1">
            {roles.map((rol) => (
              <label
                key={rol.id}
                className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  name="roles"
                  value={rol.id}
                  checked={rolesIds.includes(rol.id)}
                  onChange={() => alternarRol(rol.id)}
                  className={cn('size-4 rounded border-slate-300 accent-blue-700', FOCUS_RING)}
                />
                {rol.nombre}
              </label>
            ))}
          </div>
          {errores.rolesIds && <FieldError id={rolesErrorId}>{errores.rolesIds}</FieldError>}
        </fieldset>
      </form>
    </Modal>
  )
}

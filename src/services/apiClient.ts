import { limpiarSesion, obtenerToken } from './sesion'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Error devuelto por la API (o por la red). `estado` es 0 si no hubo respuesta. */
export class ErrorDeApi extends Error {
  estado: number
  codigo?: string
  detalle?: unknown

  constructor(mensaje: string, estado: number, codigo?: string, detalle?: unknown) {
    super(mensaje)
    this.name = 'ErrorDeApi'
    this.estado = estado
    this.codigo = codigo
    this.detalle = detalle
  }
}

interface OpcionesPeticion {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
  /** Si es false, no envia el token (login, catalogo publico). */
  auth?: boolean
}

// Tolerante con el formato de error: { error: { code, message } } o { code, message }.
function extraerError(cuerpo: unknown): { mensaje?: string; codigo?: string; detalle?: unknown } {
  if (!cuerpo || typeof cuerpo !== 'object') return {}
  const raiz = cuerpo as Record<string, unknown>
  const error = (raiz.error && typeof raiz.error === 'object' ? raiz.error : raiz) as Record<string, unknown>
  return {
    mensaje: typeof error.message === 'string' ? error.message : undefined,
    codigo: typeof error.code === 'string' ? error.code : undefined,
    detalle: error.details ?? error.detalle,
  }
}

/** Hace la peticion y devuelve el contenido de `data` de la respuesta del backend. */
export async function api<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true } = opciones

  const url = new URL(`${API_URL}${ruta}`)
  for (const [clave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(clave, String(valor))
  }

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? obtenerToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ErrorDeApi('No se pudo conectar con el servidor. Verifique que esté en ejecución.', 0)
  }

  const cuerpo: unknown = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const { mensaje, codigo, detalle } = extraerError(cuerpo)
    // Sesion vencida o invalida en una ruta protegida: volver al login.
    if (respuesta.status === 401 && auth && token) {
      limpiarSesion()
      window.location.assign('/login')
    }
    throw new ErrorDeApi(mensaje ?? `Error ${respuesta.status} del servidor.`, respuesta.status, codigo, detalle)
  }

  return (cuerpo as { data: T }).data
}

/** Variante que tambien devuelve `meta` (paginacion). */
export async function apiConMeta<T, M>(ruta: string, opciones: OpcionesPeticion = {}): Promise<{ data: T; meta: M }> {
  const { query, auth = true, method = 'GET', body } = opciones
  const url = new URL(`${API_URL}${ruta}`)
  for (const [clave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(clave, String(valor))
  }
  const token = auth ? obtenerToken() : null
  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ErrorDeApi('No se pudo conectar con el servidor. Verifique que esté en ejecución.', 0)
  }
  const cuerpo: unknown = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    const { mensaje, codigo, detalle } = extraerError(cuerpo)
    throw new ErrorDeApi(mensaje ?? `Error ${respuesta.status} del servidor.`, respuesta.status, codigo, detalle)
  }
  return cuerpo as { data: T; meta: M }
}

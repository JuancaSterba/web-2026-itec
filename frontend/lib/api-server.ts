// lib/api-server.ts
// Fetch del lado del servidor (Server Components, Server Actions y route
// handlers) contra el API Gateway: el JWT sale de la cookie httpOnly
// itec-sesion y viaja como Bearer.
import { cookies } from "next/headers"
import { redirect, unstable_rethrow } from "next/navigation"
import { COOKIE_SESION, RUTA_SESION_EXPIRADA } from "@/lib/sesion"

// Si estamos en el servidor (Node.js en Docker), debemos apuntar al servicio interno.
// Resolucion dinamica en runtime para evitar que Next.js inyecte "localhost" en build time.
export function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

// Fetch autenticado para Server Actions: un 401 del Gateway significa sesion
// vencida o invalida. El backend no guardo nada (RF-25), asi que se manda al
// login con aviso (RF-17). redirect() lanza una excepcion de Next: si quien
// llama tiene try/catch, debe llamar a unstable_rethrow(error) primero.
export async function fetchApi(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_SESION)?.value

  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`${getApiBaseUrl()}${path}`, { cache: "no-store", ...init, headers })

  if (response.status === 401) redirect(RUTA_SESION_EXPIRADA)

  return response
}

// Lectura generica para Server Components: recibe la ruta publica completa
// (ej. /api/v1/asistencias/...). Para recursos del Core, fetchCore antepone /api/v1.
export async function fetchGateway<T>(path: string): Promise<T[] | null> {
  try {
    const response = await fetchApi(path)
    if (!response.ok) return null

    const json = await response.json()
    return (json?.data as T[]) ?? null
  } catch (error) {
    // Deja pasar el redirect de sesion vencida y los errores internos de Next.
    unstable_rethrow(error)
    console.error(`Error al consultar ${path}:`, error)
    return null
  }
}

export function fetchCore<T>(path: string): Promise<T[] | null> {
  return fetchGateway<T>(`/api/v1${path}`)
}

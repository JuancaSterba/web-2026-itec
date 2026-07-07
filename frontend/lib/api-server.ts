// lib/api-server.ts
// Fetch para Server Components: token sale de la cookie auth-token (no localStorage,
// que no existe en el servidor), inyectado como Bearer contra el API Gateway.
import { cookies } from "next/headers"

// Si estamos en el servidor (Node.js en Docker), debemos apuntar al servicio interno.
// Resolucion dinamica en runtime para evitar que Next.js inyecte "localhost" en build time.
function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

// Fetch generico contra el gateway: usalo para rutas que NO viven bajo /api/core
// (ms-notas y ms-asistencias se montan directo en /api/calificaciones-parciales y
// /api/asistencias, sin RewritePath en el gateway).
export async function fetchGateway<T>(path: string): Promise<T[] | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    })

    if (!response.ok) return null

    const json = await response.json()
    return (json?.data as T[]) ?? null
  } catch (error) {
    console.error(`Error al consultar ${path}:`, error)
    return null
  }
}

export function fetchCore<T>(path: string): Promise<T[] | null> {
  return fetchGateway<T>(`/api/core${path}`)
}

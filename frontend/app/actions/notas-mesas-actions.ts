"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

// Crea (POST) o actualiza (PUT) la calificación de un alumno en una mesa de
// examen contra ms-notas. calificacionId presente => actualización.
export async function saveCalificacionMesa(payload: {
  mesaExamenId: number
  alumnoId: number
  nota: number | null
  ausente: boolean
  libro: string | null
  folio: string | null
  calificacionId?: number
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const { calificacionId, ...body } = payload
  const url = calificacionId
    ? `${getApiBaseUrl()}/api/notas/mesas/${calificacionId}`
    : `${getApiBaseUrl()}/api/notas/mesas`

  const response = await fetch(url, {
    method: calificacionId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.errors?.[0]?.description ?? "No se pudo guardar la calificación de la mesa")
  }

  revalidatePath("/dashboard/mis-mesas/[id]", "page")
}

"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

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
  const { calificacionId, ...body } = payload
  const url = calificacionId
    ? `/api/v1/notas/mesas/${calificacionId}`
    : `/api/v1/notas/mesas`

  const response = await fetchApi(url, {
    method: calificacionId ? "PUT" : "POST",
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.errors?.[0]?.description ?? "No se pudo guardar la calificación de la mesa")
  }

  revalidatePath("/dashboard/mis-mesas/[id]", "page")
}

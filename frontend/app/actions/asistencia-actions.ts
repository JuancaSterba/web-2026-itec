"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function saveAsistenciasMasivas(
  comisionId: number,
  fecha: string,
  registros: { cursadaId: number; estado: string; asistenciaId?: number }[]
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const respuestas = await Promise.all(
    registros.map((registro) => {
      const url = registro.asistenciaId
        ? `${getApiBaseUrl()}/api/asistencias/${registro.asistenciaId}`
        : `${getApiBaseUrl()}/api/asistencias`
      return fetch(url, {
        method: registro.asistenciaId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ cursadaId: registro.cursadaId, comisionId, fecha, estado: registro.estado }),
      })
    })
  )

  if (respuestas.some((response) => !response.ok)) {
    const cuerpos = await Promise.all(
      respuestas.filter((r) => !r.ok).map((r) => r.json().catch(() => null))
    )
    const mensajes = cuerpos.map((b) => b?.errors?.[0]?.description).filter(Boolean)
    return {
      error: mensajes.length > 0 ? mensajes.join(" / ") : "No se pudo guardar la lista de asistencias completa",
    }
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
  return { success: true }
}

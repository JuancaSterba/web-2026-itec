"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function saveCalificacion(
  cursadaId: number,
  instancia: string,
  nota: number,
  calificacionId?: number
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    cursadaId,
    instancia,
    nota,
    fecha: new Date().toISOString().split("T")[0],
  }

  const url = calificacionId
    ? `${getApiBaseUrl()}/api/calificaciones-parciales/${calificacionId}`
    : `${getApiBaseUrl()}/api/calificaciones-parciales`

  const response = await fetch(url, {
    method: calificacionId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo guardar la calificación")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

export async function saveCalificacionesMasivas(
  instancia: string,
  registros: { cursadaId: number; nota: number }[]
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const fecha = new Date().toISOString().split("T")[0]

  const respuestas = await Promise.all(
    registros.map((registro) =>
      fetch(`${getApiBaseUrl()}/api/calificaciones-parciales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ cursadaId: registro.cursadaId, instancia, nota: registro.nota, fecha }),
      })
    )
  )

  if (respuestas.some((response) => !response.ok)) {
    throw new Error("No se pudo guardar la instancia de evaluación completa")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

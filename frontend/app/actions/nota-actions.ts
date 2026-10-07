"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function saveCalificacion(
  cursadaId: number,
  comisionId: number,
  instancia: string,
  nota: number,
  calificacionId?: number
) {
  const payload = {
    cursadaId,
    comisionId,
    instancia,
    nota,
    fecha: new Date().toISOString().split("T")[0],
  }

  const url = calificacionId
    ? `/api/v1/calificaciones-parciales/${calificacionId}`
    : `/api/v1/calificaciones-parciales`

  const response = await fetchApi(url, {
    method: calificacionId ? "PUT" : "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo guardar la calificación")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

export async function saveCalificacionesMasivas(
  comisionId: number,
  instancia: string,
  registros: { cursadaId: number; nota: number }[]
) {
  const fecha = new Date().toISOString().split("T")[0]

  const respuestas = await Promise.all(
    registros.map((registro) =>
      fetchApi(`/api/v1/calificaciones-parciales`, {
        method: "POST",
        body: JSON.stringify({
          cursadaId: registro.cursadaId,
          comisionId,
          instancia,
          nota: registro.nota,
          fecha,
        }),
      })
    )
  )

  if (respuestas.some((response) => !response.ok)) {
    throw new Error("No se pudo guardar la instancia de evaluación completa")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

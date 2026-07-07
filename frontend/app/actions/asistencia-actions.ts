"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function saveAsistenciasMasivas(
  fecha: string,
  registros: { cursadaId: number; estado: string }[]
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const respuestas = await Promise.all(
    registros.map((registro) =>
      fetch(`${getApiBaseUrl()}/api/asistencias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ cursadaId: registro.cursadaId, fecha, estado: registro.estado }),
      })
    )
  )

  if (respuestas.some((response) => !response.ok)) {
    throw new Error("No se pudo guardar la lista de asistencias completa")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

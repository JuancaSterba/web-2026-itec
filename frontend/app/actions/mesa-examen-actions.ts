"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createMesaExamen(payload: {
  materiaPlanId: number
  periodoAcademicoId: number
  fechaHora: string
  tribunalIds: number[]
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/mesas-examen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo crear la mesa de examen")
  }

  revalidatePath("/dashboard/mesas-examen")
}

export async function inscribirAlumnoEnMesa(
  mesaExamenId: number,
  payload: { alumnoId: number; condicionInscripcion: string }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(
    `${getApiBaseUrl()}/api/core/mesas-examen/${mesaExamenId}/inscripciones`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo inscribir al alumno en la mesa")
  }

  revalidatePath("/dashboard/mesas-examen/[id]", "page")
}

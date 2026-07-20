"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createMesaExamen(payload: {
  materiaPlanId: number
  cicloLectivoId: number
  turno: string | null
  tipoMesa: "ORDINARIA" | "ESPECIAL"
  fechaHora1erLlamado?: string
  fechaHora2doLlamado?: string
  fechaHoraEspecial?: string
  tribunalIds: number[]
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const baseRequest = {
    materiaPlanId: payload.materiaPlanId,
    cicloLectivoId: payload.cicloLectivoId,
    turno: payload.turno,
    tribunalIds: payload.tribunalIds,
  }

  const requestsToMake = []

  if (payload.tipoMesa === "ORDINARIA") {
    if (!payload.fechaHora1erLlamado || !payload.fechaHora2doLlamado) {
      throw new Error("Se requieren ambas fechas para una mesa ordinaria")
    }
    requestsToMake.push({
      ...baseRequest,
      tipo: "ORDINARIA_1ER_LLAMADO",
      fechaHora: payload.fechaHora1erLlamado,
    })
    requestsToMake.push({
      ...baseRequest,
      tipo: "ORDINARIA_2DO_LLAMADO",
      fechaHora: payload.fechaHora2doLlamado,
    })
  } else {
    if (!payload.fechaHoraEspecial) {
      throw new Error("Se requiere la fecha para una mesa especial")
    }
    requestsToMake.push({
      ...baseRequest,
      tipo: "ESPECIAL",
      fechaHora: payload.fechaHoraEspecial,
    })
  }

  for (const req of requestsToMake) {
    const response = await fetch(`${getApiBaseUrl()}/api/core/mesas-examen`, {
      method: "POST",
      headers,
      body: JSON.stringify(req),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.errors?.[0]?.description ?? "No se pudo crear la mesa de examen")
    }
  }

  revalidatePath("/dashboard/mesas-examen", "page")
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

export async function updateTribunalMesa(
  mesaExamenId: number,
  payload: { tribunalIds: number[] }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(
    `${getApiBaseUrl()}/api/core/mesas-examen/${mesaExamenId}/tribunal`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo actualizar el tribunal")
  }

  revalidatePath("/dashboard/mesas-examen/[id]", "page")
}

export async function cerrarMesaExamen(mesaId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/mesas-examen/${mesaId}/cerrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo cerrar el acta de la mesa")
  }

  revalidatePath("/dashboard/mesas-examen/[id]", "page")
  revalidatePath("/dashboard/mesas-examen", "page")
}

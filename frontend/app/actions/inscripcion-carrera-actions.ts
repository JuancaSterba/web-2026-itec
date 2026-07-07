"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createInscripcionCarrera(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    alumnoId: Number(formData.get("alumnoId")),
    planEstudioId: Number(formData.get("planEstudioId")),
    fechaInscripcion: new Date().toISOString().slice(0, 10),
    estado: "ACTIVA",
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/inscripciones-carreras`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo inscribir al alumno en la carrera")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}

export async function updateInscripcionCarrera(formData: FormData, inscripcionId: number, alumnoId: number, planEstudioId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    alumnoId,
    planEstudioId,
    fechaInscripcion: formData.get("fechaInscripcion"),
    estado: formData.get("estado"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/inscripciones-carreras/${inscripcionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la inscripción")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}

export async function deleteInscripcionCarrera(inscripcionId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/inscripciones-carreras/${inscripcionId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja la inscripción")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}

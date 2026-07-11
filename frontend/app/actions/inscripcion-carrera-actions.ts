"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

// Resultado tipado en vez de throw: en producción Next enmascara los mensajes
// de los Error lanzados en server actions (solo llega un digest al cliente).
export type InscripcionResult = { ok: true } | { ok: false; error: string }

export async function createInscripcionCarrera(formData: FormData): Promise<InscripcionResult> {
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
    const body = await response.json().catch(() => null)
    return { ok: false, error: body?.errors?.[0]?.description ?? "No se pudo inscribir al alumno en la carrera" }
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
  return { ok: true }
}

export async function crearAlumnoEInscribir(formData: FormData): Promise<InscripcionResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const payloadAlumno = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    telefonoSecundario: formData.get("telefonoSecundario") ?? "",
  }

  const respuestaAlumno = await fetch(`${getApiBaseUrl()}/api/core/alumnos`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(payloadAlumno),
  })

  if (!respuestaAlumno.ok) {
    const body = await respuestaAlumno.json().catch(() => null)
    return { ok: false, error: body?.errors?.[0]?.description ?? "No se pudo crear el alumno" }
  }

  const jsonAlumno = await respuestaAlumno.json()
  const alumnoId = jsonAlumno?.data?.[0]?.id
  if (!alumnoId) {
    return { ok: false, error: "El alumno se creó pero no se pudo obtener su ID para inscribirlo" }
  }

  const payloadInscripcion = {
    alumnoId,
    planEstudioId: Number(formData.get("planEstudioId")),
    fechaInscripcion: new Date().toISOString().slice(0, 10),
    estado: "ACTIVA",
  }

  const respuestaInscripcion = await fetch(`${getApiBaseUrl()}/api/core/inscripciones-carreras`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(payloadInscripcion),
  })

  if (!respuestaInscripcion.ok) {
    const body = await respuestaInscripcion.json().catch(() => null)
    return { ok: false, error: body?.errors?.[0]?.description ?? "El alumno se creó, pero no se pudo inscribir en la carrera" }
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
  return { ok: true }
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

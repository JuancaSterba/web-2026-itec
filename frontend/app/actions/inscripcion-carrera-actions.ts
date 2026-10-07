"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

// Resultado tipado en vez de throw: en producción Next enmascara los mensajes
// de los Error lanzados en server actions (solo llega un digest al cliente).
export type InscripcionResult = { ok: true } | { ok: false; error: string }

export async function createInscripcionCarrera(formData: FormData): Promise<InscripcionResult> {
  const payload = {
    alumnoId: Number(formData.get("alumnoId")),
    planEstudioId: Number(formData.get("planEstudioId")),
    fechaInscripcion: new Date().toISOString().slice(0, 10),
    estado: "ACTIVA",
  }

  const response = await fetchApi(`/api/v1/inscripciones-carreras`, {
    method: "POST",
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
  const payloadAlumno = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    telefonoSecundario: formData.get("telefonoSecundario") ?? "",
  }

  const respuestaAlumno = await fetchApi(`/api/v1/alumnos`, {
    method: "POST",
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

  const respuestaInscripcion = await fetchApi(`/api/v1/inscripciones-carreras`, {
    method: "POST",
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
  const payload = {
    alumnoId,
    planEstudioId,
    fechaInscripcion: formData.get("fechaInscripcion"),
    estado: formData.get("estado"),
  }

  const response = await fetchApi(`/api/v1/inscripciones-carreras/${inscripcionId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la inscripción")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}

export async function deleteInscripcionCarrera(inscripcionId: number) {
  const response = await fetchApi(`/api/v1/inscripciones-carreras/${inscripcionId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja la inscripción")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}
